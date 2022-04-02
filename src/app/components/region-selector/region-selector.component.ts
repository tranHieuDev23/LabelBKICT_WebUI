import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Region } from 'src/app/services/dataaccess/api';
import { GeometryService } from './geometry/geometry.service';
import { RegionSelectorGeometryService } from './geometry/region-selector-geometry.service';
import { CanvasGraphicService } from './graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from './graphic/region-selector-graphic.service';
import { Coordinate } from './models';
import { RegionSelectorContent } from './region-selector-content';
import {
  RegionClickedEvent,
  RegionEditedEvent,
  RegionSelectedEvent,
} from './region-selector-events';
import { RegionSelectorSnapshot } from './snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from './snapshot/region-selector-snapshot.service';
import {
  DefaultState,
  DrawState,
  RegionSelectorState,
  SelectedState,
} from './states';

const VERTICES_MAX_DISTANCE = 1e-2;

const MOUSE_LEFT_BUTTON = 0;
const MAX_ZOOM_LEVEL = 100;
const MIN_ZOOM_LEVEL = 0.01;
const ZOOM_LEVEL_CHANGE = 1.2;
const SCROLL_ZOOM_RATE = 0.025;

@Component({
  selector: 'app-region-selector',
  templateUrl: './region-selector.component.html',
  styleUrls: ['./region-selector.component.scss'],
})
export class RegionSelectorComponent {
  @ViewChild('canvas', { static: true }) canvas:
    | ElementRef<HTMLCanvasElement>
    | undefined;

  private state: RegionSelectorState;

  @Input() set imageSrc(v: string) {
    this.state = this.getDefaultRegionSelectorState();
    this.onDraw();
    const image = new Image();
    image.onload = () => {
      this.state.content.image = image;
      this.centerImage();
      // HACK: This allows the DOM to initialize the image properly and fixes incorrect centering.
      setTimeout(() => {
        this.centerImage();
      }, 100);
    };
    image.src = v;
  }

  @Input() set regionList(v: Region[]) {
    this.state.content.regionList = v;
    this.onDraw();
    this.mouseOverRegionID = null;
  }

  @Input() public editable = true;

  @Output() public regionSelected = new EventEmitter<RegionSelectedEvent>();
  @Output() public regionEdited = new EventEmitter<RegionEditedEvent>();
  @Output() public regionDbClicked = new EventEmitter<RegionClickedEvent>();
  @Output() public contextMenu = new EventEmitter<RegionClickedEvent>();

  private isMouseDown = false;
  private isCtrlDown = false;
  private lastTranslateCanvasPos: Coordinate | null = null;
  private mouseOverRegionID: number | null = null;
  private isMouseOverDrawnPolygonList = false;

  constructor(
    private readonly snapshotService: RegionSelectorSnapshotService,
    private readonly geometryService: GeometryService,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {
    this.state = this.getDefaultRegionSelectorState();
    this.onDraw();
  }

  private getDefaultRegionSelectorState(): RegionSelectorState {
    return new DefaultState(
      this.getDefaultRegionSelectorContent(),
      this.snapshotService,
      this.geometryService,
      this.regionSelectorGeometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private getDefaultRegionSelectorContent(): RegionSelectorContent {
    return {
      cursorImagePosition: { x: 0, y: 0 },
      drawnPolygonList: [],
      image: null,
      imageOrigin: { x: 0, y: 0 },
      isRegionListVisible: true,
      regionList: [],
      zoom: 1,
    };
  }

  @HostListener('document: keydown', ['$event'])
  public handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Control') {
      this.isCtrlDown = true;
    }
  }

  @HostListener('document: keyup', ['$event'])
  public handleKeyup(event: KeyboardEvent): void {
    if (event.key === 'Control') {
      this.isCtrlDown = false;
    }
  }

  @HostListener('window: resize')
  public handleWindowResize(): void {
    this.centerImage();
  }

  public handleMouseDown(event: MouseEvent | TouchEvent): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }
    if (event instanceof MouseEvent && event.button !== MOUSE_LEFT_BUTTON) {
      return;
    }
    if (this.isMouseDown) {
      return;
    }
    this.isMouseDown = true;

    event.preventDefault();

    const canvasElement = this.canvas.nativeElement;
    if (this.isCtrlDown) {
      const mousePos =
        this.regionSelectorGeometryService.getMousePositionFromMouseEvent(
          event
        );
      const mouseCanvasPos =
        this.regionSelectorGeometryService.mouseToCanvasPosition(
          canvasElement,
          mousePos
        );
      this.lastTranslateCanvasPos = mouseCanvasPos;
      return;
    }

    if (this.editable) {
      this.state = this.state.onLeftMouseDown(canvasElement, event);
      this.onDraw();
    }
  }

  @HostListener('window: touchmove', ['$event'])
  @HostListener('window: mousemove', ['$event'])
  public handleMouseMove(event: MouseEvent | TouchEvent): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }

    this.updateMouseOverRegionID(event);

    const canvasElement = this.canvas.nativeElement;
    if (this.lastTranslateCanvasPos && this.isMouseDown) {
      const mousePos =
        this.regionSelectorGeometryService.getMousePositionFromMouseEvent(
          event
        );
      const mouseCanvasPos =
        this.regionSelectorGeometryService.mouseToCanvasPosition(
          canvasElement,
          mousePos
        );
      const mouseImagePos =
        this.regionSelectorGeometryService.mouseToImagePosition(
          canvasElement,
          this.state.content,
          mousePos
        );
      const lastImagePos =
        this.regionSelectorGeometryService.canvasToImagePosition(
          canvasElement,
          this.state.content,
          this.lastTranslateCanvasPos
        );
      const newImageOrigin = {
        x:
          this.state.content.imageOrigin.x - (mouseImagePos.x - lastImagePos.x),
        y:
          this.state.content.imageOrigin.y - (mouseImagePos.x - lastImagePos.y),
      };
      this.state.content.imageOrigin = newImageOrigin;
      this.lastTranslateCanvasPos = mouseCanvasPos;
      this.onDraw();
      return;
    }

    if (this.editable) {
      this.state = this.state.onMouseMove(
        canvasElement,
        event,
        this.isMouseDown
      );
      this.onDraw();
    }
  }

  @HostListener('window: touchend', ['$event'])
  @HostListener('window: mouseup', ['$event'])
  public handleMouseUp(event: MouseEvent | TouchEvent): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }
    if (event instanceof MouseEvent && event.button !== MOUSE_LEFT_BUTTON) {
      return;
    }
    if (!this.isMouseDown) {
      return;
    }
    this.isMouseDown = false;

    if (this.lastTranslateCanvasPos) {
      this.lastTranslateCanvasPos = null;
      return;
    }

    const canvasElement = this.canvas.nativeElement;
    if (this.editable) {
      this.state = this.state.onLeftMouseUp(canvasElement, event);
      this.onDraw();
    }
  }

  public zoomIn(): void {
    const newZoom = this.state.content.zoom * ZOOM_LEVEL_CHANGE;
    if (newZoom > MAX_ZOOM_LEVEL) {
      return;
    }
    this.setZoomLevel(newZoom, { x: 0.5, y: 0.5 });
  }

  public zoomOut(): void {
    const newZoom = this.state.content.zoom / ZOOM_LEVEL_CHANGE;
    if (newZoom < MIN_ZOOM_LEVEL) {
      return;
    }
    this.setZoomLevel(newZoom, { x: 0.5, y: 0.5 });
  }

  public resetZoom(): void {
    this.setZoomLevel(1, { x: 0.5, y: 0.5 });
    this.centerImage();
  }

  public setZoomLevel(zoom: number, staticImagePos: Coordinate): void {
    const zoomDifference = zoom / this.state.content.zoom;
    const newImageOriginX =
      staticImagePos.x +
      (this.state.content.imageOrigin.x - staticImagePos.x) / zoomDifference;
    const newImageOriginY =
      staticImagePos.y +
      (this.state.content.imageOrigin.y - staticImagePos.y) / zoomDifference;
    const newImageOrigin = { x: newImageOriginX, y: newImageOriginY };
    this.state.content.zoom = zoom;
    this.state.content.imageOrigin = newImageOrigin;
    this.onDraw();
  }

  public isRegionListVisible(): boolean {
    return this.state.content.isRegionListVisible;
  }

  public showRegionList(): void {
    this.state.content.isRegionListVisible = true;
    this.onDraw();
  }

  public hideRegionList(): void {
    this.state.content.isRegionListVisible = false;
    this.onDraw();
  }

  public centerImage(): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }
    const canvasCenterInImage =
      this.regionSelectorGeometryService.canvasToImagePosition(
        this.canvas.nativeElement,
        this.state.content,
        { x: 0.5, y: 0.5 }
      );
    this.state.content.imageOrigin = {
      x: this.state.content.imageOrigin.x + (0.5 - canvasCenterInImage.x),
      y: this.state.content.imageOrigin.y + (0.5 - canvasCenterInImage.y),
    };
    this.onDraw();
  }

  public isInDefaultState(): boolean {
    return this.state instanceof DefaultState;
  }

  public isInDrawState(): boolean {
    return this.state instanceof DrawState;
  }

  public isInSelectedState(): boolean {
    return this.state instanceof SelectedState;
  }

  public isInAddingVertexDrawState(): boolean {
    if (!(this.state instanceof DrawState)) {
      return false;
    }
    return this.state.isAddingVertex;
  }

  public editSelectedRegion(): void {
    if (!this.isInSelectedState()) {
      return;
    }
    const drawnPolygonList = this.state.content.drawnPolygonList;
    const densifiedDrawnPolygonList = drawnPolygonList.map((polygon) => {
      return this.geometryService.densifyPolygon(
        polygon,
        VERTICES_MAX_DISTANCE
      );
    });

    this.snapshotService.clear();
    this.snapshotService.storeSnapshot(
      new RegionSelectorSnapshot(densifiedDrawnPolygonList)
    );

    const newContent = { ...this.state.content };
    newContent.drawnPolygonList = densifiedDrawnPolygonList;
    this.state = new DrawState(
      newContent,
      true,
      null,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();
  }

  public editRegion(regionID: number): void {
    if (!this.isInDefaultState()) {
      return;
    }

    const region = this.state.content.regionList[regionID];
    const densifiedDrawnPolygonList = [
      this.geometryService.densifyPolygon(region.border, VERTICES_MAX_DISTANCE),
      ...region.holes.map((hole) => {
        return this.geometryService.densifyPolygon(hole, VERTICES_MAX_DISTANCE);
      }),
    ];

    this.snapshotService.clear();
    this.snapshotService.storeSnapshot(
      new RegionSelectorSnapshot(densifiedDrawnPolygonList)
    );

    const newContent = { ...this.state.content };
    newContent.drawnPolygonList = densifiedDrawnPolygonList;
    this.state = new DrawState(
      newContent,
      true,
      regionID,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();
  }

  public toggleDrawDelete(isDrawing: boolean): void {
    if (
      !this.isInDrawState() ||
      this.isInAddingVertexDrawState() === isDrawing
    ) {
      return;
    }
    const drawState = this.state as DrawState;
    this.state = new DrawState(
      drawState.content,
      isDrawing,
      drawState.regionIDToEdit,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();
  }

  public finishDrawing(): void {
    if (!this.isInDrawState()) {
      return;
    }

    const drawState = this.state as DrawState;
    const content = drawState.content;
    const drawnPolygonList = content.drawnPolygonList;
    if (drawnPolygonList.length === 0) {
      this.cancelDrawing();
      return;
    }

    const border = drawnPolygonList[0];
    const holes = drawnPolygonList.slice(1);

    const { border: normalizedBorder, holes: normalizedHoles } =
      this.geometryService.normalizeRegionWithHoles(border, holes);

    const newContent = { ...content };
    newContent.drawnPolygonList = [normalizedBorder, ...normalizedHoles];
    this.state = new SelectedState(
      newContent,
      this.regionSelectorGeometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();

    if (drawState.regionIDToEdit === null) {
      this.regionSelected.emit(
        new RegionSelectedEvent(normalizedBorder, normalizedHoles)
      );
    } else {
      this.regionEdited.emit(
        new RegionEditedEvent(
          drawState.regionIDToEdit,
          normalizedBorder,
          normalizedHoles
        )
      );
    }
  }

  public cancelDrawing(): void {
    const newContent = { ...this.state.content };
    newContent.drawnPolygonList = [];
    this.state = new DefaultState(
      newContent,
      this.snapshotService,
      this.geometryService,
      this.regionSelectorGeometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();
    this.snapshotService.clear();
  }

  public canUndo(): boolean {
    return this.isInDrawState() && this.snapshotService.canUndo();
  }

  public canRedo(): boolean {
    return this.isInDrawState() && this.snapshotService.canRedo();
  }

  public undo(): void {
    const undoSnapshot = this.snapshotService.undo();
    if (undoSnapshot !== null) {
      this.loadSnapshot(undoSnapshot);
    }
  }

  public redo(): void {
    const redoSnapshot = this.snapshotService.redo();
    if (redoSnapshot !== null) {
      this.loadSnapshot(redoSnapshot);
    }
  }

  public handleDbClick(event: MouseEvent): void {
    if (event.button !== MOUSE_LEFT_BUTTON) {
      return;
    }
    event.preventDefault();
    if (this.mouseOverRegionID !== null || this.isMouseOverDrawnPolygonList) {
      this.regionDbClicked.emit(
        new RegionClickedEvent(
          this.isMouseOverDrawnPolygonList,
          this.mouseOverRegionID,
          event
        )
      );
    }
  }

  public handleContextMenu(event: MouseEvent): boolean {
    event.preventDefault();
    this.contextMenu.emit(
      new RegionClickedEvent(
        this.isMouseOverDrawnPolygonList,
        this.mouseOverRegionID,
        event
      )
    );
    return false;
  }

  public handleWheel(event: WheelEvent): void {
    if (!this.canvas || !this.state.content.image || !this.isCtrlDown) {
      return;
    }
    event.preventDefault();

    const currentZoom = this.state.content.zoom;
    let newZoom =
      currentZoom *
      Math.pow(ZOOM_LEVEL_CHANGE, event.deltaY * SCROLL_ZOOM_RATE);
    newZoom = Math.min(newZoom, MAX_ZOOM_LEVEL);
    newZoom = Math.max(newZoom, MIN_ZOOM_LEVEL);

    const mousePos =
      this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const mouseImagePos =
      this.regionSelectorGeometryService.mouseToImagePosition(
        this.canvas.nativeElement,
        this.state.content,
        mousePos
      );

    this.setZoomLevel(newZoom, mouseImagePos);
  }

  private loadSnapshot(snapshot: RegionSelectorSnapshot): void {
    this.state.content.drawnPolygonList = snapshot.drawnRegionList;
    this.onDraw();
  }

  private updateMouseOverRegionID(event: MouseEvent | TouchEvent): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }

    const mousePos =
      this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const mouseImagePos =
      this.regionSelectorGeometryService.mouseToImagePosition(
        this.canvas.nativeElement,
        this.state.content,
        mousePos
      );

    const regionList = this.state.content.regionList;
    // There's a high possibility that the cursor is still inside the last region it was in.
    if (this.mouseOverRegionID !== null) {
      const lastMouseOverRegion = regionList[this.mouseOverRegionID];
      if (
        this.geometryService.isPointInPolygon(
          mouseImagePos,
          lastMouseOverRegion.border
        )
      ) {
        return;
      }
    }

    // Prioritize drawn polygon list first
    const drawnPolygonList = this.state.content.drawnPolygonList;
    const isInsideDrawnPolygon =
      drawnPolygonList.findIndex((polygon) => {
        return this.geometryService.isPointInPolygon(mouseImagePos, polygon);
      }) !== -1;
    if (isInsideDrawnPolygon) {
      this.mouseOverRegionID = null;
      this.isMouseOverDrawnPolygonList = true;
      return;
    }

    // Check region list
    const insideRegionID = regionList.findIndex((region, index) => {
      if (index === this.mouseOverRegionID) {
        return false;
      }
      return this.geometryService.isPointInPolygon(
        mouseImagePos,
        region.border
      );
    });
    if (insideRegionID >= 0) {
      this.mouseOverRegionID = insideRegionID;
      this.isMouseOverDrawnPolygonList = false;
      return;
    }

    // Mouse is not inside anything
    this.mouseOverRegionID = null;
    this.isMouseOverDrawnPolygonList = false;
  }

  private onDraw(): void {
    requestAnimationFrame(() => {
      if (!this.canvas || !this.state.content.image) {
        return;
      }

      const canvasElement = this.canvas.nativeElement;
      const ctx = this.state.onDraw(canvasElement);
      if (ctx === null) {
        return;
      }

      if (
        this.mouseOverRegionID !== null &&
        !this.isInDrawState() &&
        this.isRegionListVisible()
      ) {
        this.regionSelectorGraphicService.drawRegionLabel(
          canvasElement,
          ctx,
          this.state.content,
          this.mouseOverRegionID
        );
      }
    });
  }
}
