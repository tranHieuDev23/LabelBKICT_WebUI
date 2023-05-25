import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Region } from 'src/app/services/dataaccess/api';
import { GeometryService } from './geometry/geometry.service';
import { RegionSelectorGeometryService } from './geometry/region-selector-geometry.service';
import { CanvasGraphicService } from './graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from './graphic/region-selector-graphic.service';
import { Coordinate, Eclipse, FreePolygon, Rectangle } from './models';
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
  EditState,
} from './states';
import { MAX_OPERATION_MOUSE_DISTANCE, RegionSelectorElement } from './common/constants';

const VERTICES_MAX_DISTANCE = 1e-2;

const MOUSE_LEFT_BUTTON = 0;
const MAX_ZOOM_LEVEL = 100;
const MIN_ZOOM_LEVEL = 0.01;
const DEFAULT_ZOOM_LEVEL = 0.9;
const ZOOM_LEVEL_CHANGE = 1.2;
const SCROLL_ZOOM_RATE = 0.025;
const MIN_MARGIN_DISTANCE = 0.05;

enum RegionSelectorMouseMoveOperation {
  TRANSLATE = 1,
  ADJUST_DRAW_MARGIN = 2,
  ADJUST_DRAW_BOUNDARY = 3,
  STATE_OPERATION = 4,
}

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
      this.centerDrawBoundaryInImage();
      // HACK: This allows the DOM to initialize the image properly and fixes incorrect centering.
      setTimeout(() => {
        this.centerImage();
        this.centerDrawBoundaryInImage();
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
  private mouseOverElement: RegionSelectorElement | null = null;
  private mouseMoveOperation: RegionSelectorMouseMoveOperation = RegionSelectorMouseMoveOperation.STATE_OPERATION;

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
      zoom: DEFAULT_ZOOM_LEVEL,
      drawMarginEnabled: true,
      drawMargin: new Rectangle(0, 1, 0, 1),
      drawBoundaryEnabled: false,
      drawBoundary: new Eclipse({ x: 0.5, y: 0.5 }, 0.5, 0.5),
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
    const mousePos = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);

    if (this.shouldEnterTranslateOperation()) {
      this.mouseMoveOperation = RegionSelectorMouseMoveOperation.TRANSLATE;
      this.lastTranslateMousePos = mousePos;
    } else if (this.shouldEnterAdjustDrawMarginOperation()) {
      this.mouseMoveOperation = RegionSelectorMouseMoveOperation.ADJUST_DRAW_MARGIN;
    } else if (this.shouldEnterAdjustDrawBoundaryOperation()) {
      this.mouseMoveOperation = RegionSelectorMouseMoveOperation.ADJUST_DRAW_BOUNDARY;
    } else if (this.shouldEnterStateOperation()) {
      this.mouseMoveOperation = RegionSelectorMouseMoveOperation.STATE_OPERATION;
      this.state = this.state.onLeftMouseDown(canvasElement, event);
    }

    this.onDraw();
  }

  private shouldEnterTranslateOperation(): boolean {
    return this.isCtrlDown;
  }

  private shouldEnterAdjustDrawMarginOperation(): boolean {
    return (
      this.mouseOverElement === RegionSelectorElement.DRAW_MARGIN_LEFT ||
      this.mouseOverElement === RegionSelectorElement.DRAW_MARGIN_RIGHT ||
      this.mouseOverElement === RegionSelectorElement.DRAW_MARGIN_BOTTOM ||
      this.mouseOverElement === RegionSelectorElement.DRAW_MARGIN_TOP
    );
  }

  private shouldEnterAdjustDrawBoundaryOperation(): boolean {
    return this.mouseOverElement === RegionSelectorElement.DRAW_BOUNDARY;
  }

  private shouldEnterStateOperation(): boolean {
    return this.editable;
  }

  @HostListener('window: touchmove', ['$event'])
  @HostListener('window: mousemove', ['$event'])
  public handleMouseMove(event: MouseEvent | TouchEvent): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }

    if (!this.isMouseDown) {
      this.updateMouseOverElementAndRegionID(event);
    }

    const canvasElement = this.canvas.nativeElement;
    const mousePos = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const mouseImagePos = this.regionSelectorGeometryService.mouseToImagePosition(
      canvasElement,
      this.state.content,
      mousePos
    );

    switch (this.mouseMoveOperation) {
      case RegionSelectorMouseMoveOperation.TRANSLATE:
        this.handleMouseMoveTranslateOperation(canvasElement, this.state.content, mousePos, mouseImagePos);
        break;

      case RegionSelectorMouseMoveOperation.ADJUST_DRAW_MARGIN:
        this.handleMouseMoveAdjustDrawMarginOperation(this.state.content, mouseImagePos);
        break;

      case RegionSelectorMouseMoveOperation.ADJUST_DRAW_BOUNDARY:
        this.handleMouseMoveAdjustDrawBoundaryOperation(canvasElement, this.state.content, mousePos);
        break;

      case RegionSelectorMouseMoveOperation.STATE_OPERATION:
        this.handleMouseMoveStateOperation(canvasElement, event);
        break;
    }

    this.onDraw();
  }

  private handleMouseMoveTranslateOperation(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    mousePos: Coordinate,
    mouseImagePos: Coordinate
  ): void {
    if (this.lastTranslateMousePos === null || !this.isMouseDown) {
      return;
    }
    const lastTranslateImagePos = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      content,
      this.lastTranslateMousePos
    );
    const newImageOrigin = {
      x: this.state.content.imageOrigin.x - (mouseImagePos.x - lastTranslateImagePos.x),
      y: this.state.content.imageOrigin.y - (mouseImagePos.y - lastTranslateImagePos.y),
    };
    this.state.content.imageOrigin = newImageOrigin;
    this.lastTranslateMousePos = mousePos;
  }

  private handleMouseMoveAdjustDrawMarginOperation(content: RegionSelectorContent, mouseImagePos: Coordinate): void {
    if (!this.isMouseDown) {
      return;
    }
    const { drawMargin } = content;
    switch (this.mouseOverElement) {
      case RegionSelectorElement.DRAW_MARGIN_LEFT:
        const newLeft = Math.max(mouseImagePos.x, 0);
        if (drawMargin.right - newLeft >= MIN_MARGIN_DISTANCE) {
          content.drawMargin = new Rectangle(newLeft, drawMargin.right, drawMargin.bottom, drawMargin.top);
        }
        break;
      case RegionSelectorElement.DRAW_MARGIN_RIGHT:
        const newRight = Math.min(mouseImagePos.x, 1);
        if (newRight - drawMargin.left >= MIN_MARGIN_DISTANCE) {
          content.drawMargin = new Rectangle(drawMargin.left, newRight, drawMargin.bottom, drawMargin.top);
        }
        break;
      case RegionSelectorElement.DRAW_MARGIN_BOTTOM:
        const newBottom = Math.max(mouseImagePos.y, 0);
        if (drawMargin.top - newBottom >= MIN_MARGIN_DISTANCE) {
          content.drawMargin = new Rectangle(drawMargin.left, drawMargin.right, newBottom, drawMargin.top);
        }
        break;
      case RegionSelectorElement.DRAW_MARGIN_TOP:
        const newTop = Math.min(mouseImagePos.y, 1);
        if (newTop - drawMargin.bottom >= MIN_MARGIN_DISTANCE) {
          content.drawMargin = new Rectangle(drawMargin.left, drawMargin.right, drawMargin.bottom, newTop);
        }
        break;
    }
  }

  private handleMouseMoveAdjustDrawBoundaryOperation(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    mousePos: Coordinate
  ): void {
    if (!this.isMouseDown) {
      return;
    }
    const boundaryCenterMousePosition = this.regionSelectorGeometryService.imageToMousePosition(
      canvas,
      content,
      content.drawBoundary.center
    );
    const boundaryMouseLeftPosition = this.regionSelectorGeometryService.imageToMousePosition(canvas, content, {
      x: 0,
      y: content.drawBoundary.center.y,
    });
    const boundaryMouseRightPosition = this.regionSelectorGeometryService.imageToMousePosition(canvas, content, {
      x: 1,
      y: content.drawBoundary.center.y,
    });
    const boundaryMouseBottomPosition = this.regionSelectorGeometryService.imageToMousePosition(canvas, content, {
      x: content.drawBoundary.center.x,
      y: 0,
    });
    const boundaryMouseTopPosition = this.regionSelectorGeometryService.imageToMousePosition(canvas, content, {
      x: content.drawBoundary.center.x,
      y: 1,
    });
    const newMouseRadius = Math.min(
      this.geometryService.getDistance(boundaryCenterMousePosition, mousePos),
      Math.max(
        this.geometryService.getDistance(boundaryCenterMousePosition, boundaryMouseLeftPosition),
        this.geometryService.getDistance(boundaryCenterMousePosition, boundaryMouseRightPosition),
        this.geometryService.getDistance(boundaryCenterMousePosition, boundaryMouseBottomPosition),
        this.geometryService.getDistance(boundaryCenterMousePosition, boundaryMouseTopPosition)
      )
    );
    const newImageRadiusX = this.regionSelectorGeometryService.mouseToImageDistance(
      canvas,
      content,
      boundaryCenterMousePosition,
      {
        x: boundaryCenterMousePosition.x + newMouseRadius,
        y: boundaryCenterMousePosition.y,
      }
    );
    const newImageRadiusY = this.regionSelectorGeometryService.mouseToImageDistance(
      canvas,
      content,
      boundaryCenterMousePosition,
      {
        x: boundaryCenterMousePosition.x,
        y: boundaryCenterMousePosition.y + newMouseRadius,
      }
    );
    content.drawBoundary = new Eclipse(content.drawBoundary.center, newImageRadiusX, newImageRadiusY);
  }

  private handleMouseMoveStateOperation(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): void {
    if (this.editable) {
      this.state = this.state.onMouseMove(canvas, event, this.isMouseDown);
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

    if (this.mouseMoveOperation === RegionSelectorMouseMoveOperation.TRANSLATE) {
      this.mouseMoveOperation = RegionSelectorMouseMoveOperation.STATE_OPERATION;
      this.lastTranslateMousePos = null;
      this.onDraw();
      return;
    }

    this.mouseMoveOperation = RegionSelectorMouseMoveOperation.STATE_OPERATION;

    const canvasElement = this.canvas.nativeElement;
    if (this.editable) {
      this.state = this.state.onLeftMouseUp(canvasElement, event);
    }

    this.onDraw();
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
    this.setZoomLevel(DEFAULT_ZOOM_LEVEL, { x: 0.5, y: 0.5 });
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

  public toggleRegionList(): void {
    this.state.content.isRegionListVisible = !this.state.content.isRegionListVisible;
    this.onDraw();
  }

  public showRegionList(): void {
    this.state.content.isRegionListVisible = true;
    this.onDraw();
  }

  public hideRegionList(): void {
    this.state.content.isRegionListVisible = false;
    this.onDraw();
  }

  public isDrawMarginsEnabled(): boolean {
    return this.state.content.drawMarginEnabled;
  }

  public toggleDrawMargins(): void {
    this.state.content.drawMarginEnabled = !this.state.content.drawMarginEnabled;
    this.onDraw();
  }

  public showDrawMargins(): void {
    this.state.content.drawMarginEnabled = true;
    this.onDraw();
  }

  public hideDrawMargins(): void {
    this.state.content.drawMarginEnabled = false;
    this.onDraw();
  }

  public setDrawMargins(drawMargin: Rectangle): void {
    this.state.content.drawMargin = drawMargin;
    this.onDraw();
  }

  public isDrawBoundaryEnabled(): boolean {
    return this.state.content.drawBoundaryEnabled;
  }

  public toggleDrawBoundary(): void {
    this.state.content.drawBoundaryEnabled = !this.state.content.drawBoundaryEnabled;
    this.onDraw();
  }

  public showDrawBoundary(): void {
    this.state.content.drawBoundaryEnabled = true;
    this.onDraw();
  }

  public hideDrawBoundary(): void {
    this.state.content.drawBoundaryEnabled = false;
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

  public centerDrawBoundaryInImage(): void {
    this.centerDrawBoundaryInImageMargin(new Rectangle(0, 1, 0, 1));
  }

  public centerDrawBoundaryInDrawMargins(): void {
    this.centerDrawBoundaryInImageMargin(this.state.content.drawMargin);
  }

  private centerDrawBoundaryInImageMargin(imageMargin: Rectangle): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }
    const marginImageCenter = imageMargin.getCenter();
    const marginMouseCenter = this.regionSelectorGeometryService.imageToMousePosition(
      this.canvas.nativeElement,
      this.state.content,
      marginImageCenter
    );
    const boundaryMouseRadius = Math.max(
      this.regionSelectorGeometryService.imageToMouseDistance(
        this.canvas.nativeElement,
        this.state.content,
        marginImageCenter,
        { x: imageMargin.left, y: marginImageCenter.y }
      ),
      this.regionSelectorGeometryService.imageToMouseDistance(
        this.canvas.nativeElement,
        this.state.content,
        marginImageCenter,
        { x: marginImageCenter.x, y: imageMargin.bottom }
      )
    );
    const boundaryImageRadiusX = this.regionSelectorGeometryService.mouseToImageDistance(
      this.canvas.nativeElement,
      this.state.content,
      marginMouseCenter,
      { x: marginMouseCenter.x - boundaryMouseRadius, y: marginMouseCenter.y }
    );
    const boundaryImageRadiusY = this.regionSelectorGeometryService.mouseToImageDistance(
      this.canvas.nativeElement,
      this.state.content,
      marginMouseCenter,
      { x: marginMouseCenter.x, y: marginMouseCenter.y - boundaryMouseRadius }
    );
    this.state.content.drawBoundary = new Eclipse(marginImageCenter, boundaryImageRadiusX, boundaryImageRadiusY);
    this.onDraw();
  }

  public isInDefaultState(): boolean {
    return this.state instanceof DefaultState;
  }

  public isEditing(): boolean {
    return this.state instanceof EditState;
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
    const regionIDToEdit = this.state instanceof EditState ? this.state.regionIDToEdit : null;
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
    const regionIDToEdit = this.state instanceof EditState ? this.state.regionIDToEdit : null;
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
    const regionIDToEdit = this.state instanceof EditState ? this.state.regionIDToEdit : null;
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
    const regionIDToEdit = this.state instanceof EditState ? this.state.regionIDToEdit : null;
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
    this.state = new DeleteState(
      newContent,
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
    this.state = new DeleteState(
      newContent,
      regionID,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
    this.onDraw();
  }

  public finishDrawing(): void {
    if (!this.isEditing()) {
      return;
    }

    const drawState = this.state as FreePolygonDrawState;
    const content = drawState.content;
    const drawnShapeList = content.drawnShapeList;
    if (drawnShapeList.length === 0) {
      this.cancelDrawing();
      return;
    }

    const sortedDrawnShapeList = [...drawnShapeList].sort((a, b) => b.getArea() - a.getArea());
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
    return this.isEditing() && this.snapshotService.canUndo();
  }

  public canRedo(): boolean {
    return this.isEditing() && this.snapshotService.canRedo();
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
    if (
      this.mouseOverElement === RegionSelectorElement.DRAWN_SHAPE_LIST ||
      this.mouseOverElement === RegionSelectorElement.REGION_LIST
    ) {
      this.regionDbClicked.emit(
        new RegionClickedEvent(
          this.mouseOverElement === RegionSelectorElement.DRAWN_SHAPE_LIST,
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
        this.mouseOverElement === RegionSelectorElement.DRAWN_SHAPE_LIST,
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

  private updateMouseOverElementAndRegionID(event: MouseEvent | TouchEvent): void {
    if (!this.canvas || !this.state.content.image) {
      return;
    }

    const mousePos = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const mouseImagePos = this.regionSelectorGeometryService.mouseToImagePosition(
      this.canvas.nativeElement,
      this.state.content,
      mousePos
    );

    // Check if mouse is over drawn polygon list
    const drawnShapeList = this.state.content.drawnShapeList;
    const isInsideDrawnPolygon =
      drawnShapeList.findIndex((polygon) => {
        return polygon.isPointInside(mouseImagePos);
      }) !== -1;
    if (isInsideDrawnPolygon) {
      this.mouseOverElement = RegionSelectorElement.DRAWN_SHAPE_LIST;
      this.mouseOverRegionID = null;
      return;
    }

    // Check if mouse is over region list, prioritize the smallest region first
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
      this.mouseOverElement = RegionSelectorElement.REGION_LIST;
      this.mouseOverRegionID = insideRegionID;
      return;
    }

    // Check if mouse is over draw margin
    if (this.state.content.drawMarginEnabled) {
      const mouseOverMargin = this.checkMouseOverDrawMargin(
        this.canvas.nativeElement,
        this.state.content,
        mouseImagePos
      );
      if (mouseOverMargin != null) {
        this.mouseOverElement = mouseOverMargin;
        this.mouseOverRegionID = null;
        return;
      }
    }

    // Check if mouse is over draw boundary
    if (this.state.content.drawBoundaryEnabled) {
      if (this.isMouseOverDrawBoundary(this.canvas.nativeElement, this.state.content, mouseImagePos)) {
        this.mouseOverElement = RegionSelectorElement.DRAW_BOUNDARY;
        this.mouseOverRegionID = null;
        return;
      }
    }

    // Mouse is not inside anything
    this.mouseOverRegionID = null;
    this.mouseOverElement = null;
  }

  private checkMouseOverDrawMargin(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    mouseImagePos: Coordinate
  ): RegionSelectorElement | null {
    const marginLeftCanvasDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      content,
      mouseImagePos,
      { x: content.drawMargin.left, y: mouseImagePos.y }
    );
    if (marginLeftCanvasDistance <= MAX_OPERATION_MOUSE_DISTANCE) {
      return RegionSelectorElement.DRAW_MARGIN_LEFT;
    }

    const marginRightCanvasDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      content,
      mouseImagePos,
      { x: content.drawMargin.right, y: mouseImagePos.y }
    );
    if (marginRightCanvasDistance <= MAX_OPERATION_MOUSE_DISTANCE) {
      return RegionSelectorElement.DRAW_MARGIN_RIGHT;
    }

    const marginBottomCanvasDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      content,
      mouseImagePos,
      { x: mouseImagePos.x, y: content.drawMargin.bottom }
    );
    if (marginBottomCanvasDistance <= MAX_OPERATION_MOUSE_DISTANCE) {
      return RegionSelectorElement.DRAW_MARGIN_BOTTOM;
    }

    const marginTopCanvasDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      content,
      mouseImagePos,
      { x: mouseImagePos.x, y: content.drawMargin.top }
    );
    if (marginTopCanvasDistance <= MAX_OPERATION_MOUSE_DISTANCE) {
      return RegionSelectorElement.DRAW_MARGIN_TOP;
    }

    return null;
  }

  private isMouseOverDrawBoundary(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    mouseImagePos: Coordinate
  ): boolean {
    const mouseBoundaryRadius = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      content,
      content.drawBoundary.center,
      {
        x: content.drawBoundary.center.x + content.drawBoundary.radiusX,
        y: content.drawBoundary.center.y,
      }
    );
    const boundaryCenterCursorDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      content,
      mouseImagePos,
      content.drawBoundary.center
    );
    const diameterCursorDistance = Math.abs(boundaryCenterCursorDistance - mouseBoundaryRadius);
    return diameterCursorDistance <= MAX_OPERATION_MOUSE_DISTANCE;
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

      this.regionSelectorGraphicService.drawMarginAndBoundaryMask(canvasElement, ctx, this.state.content);
      this.regionSelectorGraphicService.drawDrawMargin(canvasElement, ctx, this.state.content, this.mouseOverElement);
      this.regionSelectorGraphicService.drawDrawBoundary(canvasElement, ctx, this.state.content, this.mouseOverElement);

      if (this.mouseOverRegionID !== null && !this.isEditing() && this.isRegionListVisible()) {
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
