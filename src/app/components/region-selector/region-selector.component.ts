import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Region } from 'src/app/services/dataaccess/api';
import { GeometryService } from './geometry/geometry.service';
import { RegionSelectorGeometryService } from './geometry/region-selector-geometry.service';
import { CanvasGraphicService } from './graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from './graphic/region-selector-graphic.service';
import { Coordinate, FreePolygon } from './models';
import { RegionSelectorContent } from './region-selector-content';
import { RegionClickedEvent, RegionEditedEvent, RegionSelectedEvent } from './region-selector-events';
import { RegionSelectorSnapshot } from './snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from './snapshot/region-selector-snapshot.service';
import {
  DefaultState,
  FreePolygonDrawState,
  CircleDrawState,
  DeleteState,
  RegionSelectorState,
  SelectedState,
  RectangleDrawState,
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
export class RegionSelectorComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement> | undefined;

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
      }, 0);
    };
    image.src = v;
  }

  @Input() set regionList(v: Region[]) {
    this.state.content.regionList = v;
    this.onDraw();
    this.mouseOverRegionID = null;
  }

  private _editable = true;

  @Input() public set editable(v: boolean) {
    this._editable = v;
    if (!this.isInDefaultState()) {
      this.cancelDrawing();
    }
  }

  public get editable(): boolean {
    return this._editable;
  }

  @Output() public regionSelected = new EventEmitter<RegionSelectedEvent>();
  @Output() public regionEdited = new EventEmitter<RegionEditedEvent>();
  @Output() public regionDbClicked = new EventEmitter<RegionClickedEvent>();
  @Output() public contextMenu = new EventEmitter<RegionClickedEvent>();

  private isMouseDown = false;
  private isCtrlDown = false;
  private lastTranslateMousePos: Coordinate | null = null;
  private mouseOverRegionID: number | null = null;
  private isMouseOverDrawnShapeList = false;

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

  ngOnInit(): void {
    if (this.canvas) {
      this.canvasGraphicService.resizeCanvasMatchParent(this.canvas.nativeElement);
    }
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
      drawnShapeList: [],
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
      const mousePos = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
      this.lastTranslateMousePos = mousePos;
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
    if (this.lastTranslateMousePos && this.isMouseDown) {
      const mousePos = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
      const mouseImagePos = this.regionSelectorGeometryService.mouseToImagePosition(
        canvasElement,
        this.state.content,
        mousePos
      );
      const lastTranslateImagePos = this.regionSelectorGeometryService.mouseToImagePosition(
        canvasElement,
        this.state.content,
        this.lastTranslateMousePos
      );
      const newImageOrigin = {
        x: this.state.content.imageOrigin.x - (mouseImagePos.x - lastTranslateImagePos.x),
        y: this.state.content.imageOrigin.y - (mouseImagePos.y - lastTranslateImagePos.y),
      };
      this.state.content.imageOrigin = newImageOrigin;
      this.lastTranslateMousePos = mousePos;
      this.onDraw();
      return;
    }

    if (this.editable) {
      this.state = this.state.onMouseMove(canvasElement, event, this.isMouseDown);
      this.onDraw();
      return;
    }

    this.onDraw();
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

    if (this.lastTranslateMousePos) {
      this.lastTranslateMousePos = null;
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
    const newImageOriginX = staticImagePos.x + (this.state.content.imageOrigin.x - staticImagePos.x) / zoomDifference;
    const newImageOriginY = staticImagePos.y + (this.state.content.imageOrigin.y - staticImagePos.y) / zoomDifference;
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
    const canvasCenterImagePos = this.regionSelectorGeometryService.canvasToImagePosition(
      this.canvas.nativeElement,
      this.state.content,
      { x: 0.5, y: 0.5 }
    );
    this.state.content.imageOrigin = {
      x: this.state.content.imageOrigin.x + (0.5 - canvasCenterImagePos.x),
      y: this.state.content.imageOrigin.y + (0.5 - canvasCenterImagePos.y),
    };
    this.onDraw();
  }

  public isInDefaultState(): boolean {
    return this.state instanceof DefaultState;
  }

  public isDrawingOrDeleting(): boolean {
    return (
      this.isInFreePolygonDrawState() ||
      this.isInCircleDrawState() ||
      this.isInRectangleDrawState() ||
      this.isInDeleteState()
    );
  }

  public isInFreePolygonDrawState(): boolean {
    return this.state instanceof FreePolygonDrawState;
  }

  public onFreePolygonDrawStateClicked(): void {
    if (this.isInFreePolygonDrawState()) {
      return;
    }
    if (this.snapshotService.snapshotSize() === 0) {
      this.snapshotService.storeSnapshot(new RegionSelectorSnapshot([]));
    }
    const regionIDToEdit =
      this.state instanceof CircleDrawState ||
      this.state instanceof RectangleDrawState ||
      this.state instanceof DeleteState
        ? this.state.regionIDToEdit
        : null;
    this.state = new FreePolygonDrawState(
      this.state.content,
      regionIDToEdit,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();
  }

  public isInCircleDrawState(): boolean {
    return this.state instanceof CircleDrawState;
  }

  public onCircleDrawStateClicked(): void {
    if (this.isInCircleDrawState()) {
      return;
    }
    if (this.snapshotService.snapshotSize() === 0) {
      this.snapshotService.storeSnapshot(new RegionSelectorSnapshot([]));
    }
    const regionIDToEdit =
      this.state instanceof FreePolygonDrawState ||
      this.state instanceof RectangleDrawState ||
      this.state instanceof DeleteState
        ? this.state.regionIDToEdit
        : null;
    this.state = new CircleDrawState(
      this.state.content,
      regionIDToEdit,
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

  public isInRectangleDrawState(): boolean {
    return this.state instanceof RectangleDrawState;
  }

  public onRectangleDrawStateClicked(): void {
    if (this.isInRectangleDrawState()) {
      return;
    }
    if (this.snapshotService.snapshotSize() === 0) {
      this.snapshotService.storeSnapshot(new RegionSelectorSnapshot([]));
    }
    const regionIDToEdit =
      this.state instanceof FreePolygonDrawState ||
      this.state instanceof CircleDrawState ||
      this.state instanceof DeleteState
        ? this.state.regionIDToEdit
        : null;
    this.state = new RectangleDrawState(
      this.state.content,
      regionIDToEdit,
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

  public isInDeleteState(): boolean {
    return this.state instanceof DeleteState;
  }

  public onDeleteStateClicked(): void {
    if (this.isInDeleteState()) {
      return;
    }
    const regionIDToEdit =
      this.state instanceof FreePolygonDrawState || this.state instanceof CircleDrawState
        ? this.state.regionIDToEdit
        : null;
    this.state = new DeleteState(
      this.state.content,
      regionIDToEdit,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();
  }

  public isInSelectedState(): boolean {
    return this.state instanceof SelectedState;
  }

  public editSelectedRegion(): void {
    if (!this.isInSelectedState()) {
      return;
    }
    const drawnShapeList = this.state.content.drawnShapeList;
    const densifiedDrawnShapeList = drawnShapeList.map((polygon) => {
      return this.geometryService.densifyShape(polygon, VERTICES_MAX_DISTANCE);
    });

    this.snapshotService.clear();
    this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(densifiedDrawnShapeList));

    const newContent = { ...this.state.content };
    newContent.drawnShapeList = densifiedDrawnShapeList;
    this.state = new FreePolygonDrawState(
      newContent,
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
      this.geometryService.densifyShape(new FreePolygon(region.border.vertices), VERTICES_MAX_DISTANCE),
      ...region.holes.map((hole) => {
        return this.geometryService.densifyShape(new FreePolygon(hole.vertices), VERTICES_MAX_DISTANCE);
      }),
    ];

    this.snapshotService.clear();
    this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(densifiedDrawnPolygonList));

    const newContent = { ...this.state.content };
    newContent.drawnShapeList = densifiedDrawnPolygonList;
    this.state = new FreePolygonDrawState(
      newContent,
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

  public finishDrawing(): void {
    if (!this.isDrawingOrDeleting()) {
      return;
    }

    const drawState = this.state as FreePolygonDrawState;
    const content = drawState.content;
    const drawnShapeList = content.drawnShapeList;
    if (drawnShapeList.length === 0) {
      this.cancelDrawing();
      return;
    }

    const sortedDrawnShapeList = [...drawnShapeList].sort((a, b) => {
      console.log(a, b, a.getArea(), b.getArea());
      return b.getArea() - a.getArea();
    });
    console.log(sortedDrawnShapeList);
    const border = sortedDrawnShapeList[0];
    const holes = sortedDrawnShapeList.slice(1);

    const { border: normalizedBorder, holeList: normalizedHoleList } = this.geometryService.normalizeRegionWithHoles(
      border,
      holes
    );

    const newContent = { ...content };
    newContent.drawnShapeList = [normalizedBorder, ...normalizedHoleList];
    this.state = new SelectedState(
      newContent,
      this.regionSelectorGeometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();

    if (drawState.regionIDToEdit === null) {
      this.regionSelected.emit(new RegionSelectedEvent(normalizedBorder, normalizedHoleList));
    } else {
      this.regionEdited.emit(new RegionEditedEvent(drawState.regionIDToEdit, normalizedBorder, normalizedHoleList));
    }
  }

  public cancelDrawing(): void {
    const newContent = { ...this.state.content };
    newContent.drawnShapeList = [];
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
    return this.isDrawingOrDeleting() && this.snapshotService.canUndo();
  }

  public canRedo(): boolean {
    return this.isDrawingOrDeleting() && this.snapshotService.canRedo();
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
    if (this.mouseOverRegionID !== null || this.isMouseOverDrawnShapeList) {
      this.regionDbClicked.emit(new RegionClickedEvent(this.isMouseOverDrawnShapeList, this.mouseOverRegionID, event));
    }
  }

  public handleContextMenu(event: MouseEvent): boolean {
    event.preventDefault();
    this.contextMenu.emit(new RegionClickedEvent(this.isMouseOverDrawnShapeList, this.mouseOverRegionID, event));
    return false;
  }

  public handleWheel(event: WheelEvent): void {
    if (!this.canvas || !this.state.content.image || !this.isCtrlDown) {
      return;
    }
    event.preventDefault();

    const currentZoom = this.state.content.zoom;
    let newZoom = currentZoom * Math.pow(ZOOM_LEVEL_CHANGE, event.deltaY * SCROLL_ZOOM_RATE);
    newZoom = Math.min(newZoom, MAX_ZOOM_LEVEL);
    newZoom = Math.max(newZoom, MIN_ZOOM_LEVEL);

    const mousePos = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const mouseImagePos = this.regionSelectorGeometryService.mouseToImagePosition(
      this.canvas.nativeElement,
      this.state.content,
      mousePos
    );

    this.setZoomLevel(newZoom, mouseImagePos);
  }

  private loadSnapshot(snapshot: RegionSelectorSnapshot): void {
    this.state.content.drawnShapeList = snapshot.drawnShapeList;
    this.onDraw();
  }

  private updateMouseOverRegionID(event: MouseEvent | TouchEvent): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }

    const mousePos = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const mouseImagePos = this.regionSelectorGeometryService.mouseToImagePosition(
      this.canvas.nativeElement,
      this.state.content,
      mousePos
    );

    // Prioritize drawn polygon list first
    const drawnShapeList = this.state.content.drawnShapeList;
    const isInsideDrawnPolygon =
      drawnShapeList.findIndex((polygon) => {
        return polygon.isPointInside(mouseImagePos);
      }) !== -1;
    if (isInsideDrawnPolygon) {
      this.mouseOverRegionID = null;
      this.isMouseOverDrawnShapeList = true;
      return;
    }

    // Check region list, prioritize the smallest region first
    const regionList = this.state.content.regionList;
    let insideRegionID = -1;
    let insideRegionArea = Infinity;
    for (let i = 0; i < regionList.length; i++) {
      const region = regionList[i];
      const regionPolygon = new FreePolygon(region.border.vertices);
      if (!regionPolygon.isPointInside(mouseImagePos)) {
        continue;
      }
      const regionArea = regionPolygon.getArea();
      if (regionPolygon.getArea() < insideRegionArea) {
        insideRegionID = i;
        insideRegionArea = regionArea;
      }
    }
    if (insideRegionID >= 0) {
      this.mouseOverRegionID = insideRegionID;
      this.isMouseOverDrawnShapeList = false;
      return;
    }

    // Mouse is not inside anything
    this.mouseOverRegionID = null;
    this.isMouseOverDrawnShapeList = false;
  }

  private onDraw(): void {
    requestAnimationFrame(() => {
      if (!this.canvas || !this.state.content.image) {
        return;
      }

      const canvasElement = this.canvas.nativeElement;
      this.canvasGraphicService.resizeCanvasMatchParent(canvasElement);
      const ctx = this.state.onDraw(canvasElement);
      if (ctx === null) {
        return;
      }

      if (this.mouseOverRegionID !== null && !this.isDrawingOrDeleting() && this.isRegionListVisible()) {
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
