import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { Circle, Coordinate } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { RegionSelectorState } from './region-selector-state';

const MAX_OPERATION_MOUSE_DISTANCE = 10;

export enum CircleDrawStateOperation {
  MOVE = 0,
  RESIZE = 1,
}

export class CircleDrawState implements RegionSelectorState {
  constructor(
    public readonly content: RegionSelectorContent,
    public readonly regionIDToEdit: number | null,
    public readonly operation: CircleDrawStateOperation | null,
    public readonly shapeIDToOperate: number | null,
    private readonly snapshotService: RegionSelectorSnapshotService,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly geometryService: GeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {}

  public onLeftMouseDown(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState {
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );

    const operationAndShapeIDToOperate = this.getOperationAndShapeIDToOperate(canvas, cursorMousePosition);
    if (operationAndShapeIDToOperate === null) {
      const newContent = { ...this.content };
      const shapeIDToOperate = newContent.drawnShapeList.length;
      newContent.drawnShapeList = [...newContent.drawnShapeList, new Circle(cursorImagePosition, 0)];
      return new CircleDrawState(
        newContent,
        this.regionIDToEdit,
        CircleDrawStateOperation.RESIZE,
        shapeIDToOperate,
        this.snapshotService,
        this.regionSelectorGeometryService,
        this.geometryService,
        this.regionSelectorGraphicService,
        this.canvasGraphicService
      );
    }

    const { operation, shapeID } = operationAndShapeIDToOperate;
    return new CircleDrawState(
      this.content,
      this.regionIDToEdit,
      operation,
      shapeID,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private getOperationAndShapeIDToOperate(
    canvas: HTMLCanvasElement,
    cursorMousePosition: Coordinate
  ): {
    operation: CircleDrawStateOperation;
    shapeID: number;
  } | null {
    let operation = CircleDrawStateOperation.MOVE;
    let shapeID = -1;
    let minDistance = Infinity;

    for (let i = 0; i < this.content.drawnShapeList.length; i++) {
      const shape = this.content.drawnShapeList[i];
      if (!(shape instanceof Circle)) {
        continue;
      }

      const centerMousePosition = this.regionSelectorGeometryService.imageToMousePosition(
        canvas,
        this.content,
        shape.center
      );
      const centerCursorDistance = this.geometryService.getDistance(centerMousePosition, cursorMousePosition);
      if (centerCursorDistance < minDistance) {
        operation = CircleDrawStateOperation.MOVE;
        shapeID = i;
        minDistance = centerCursorDistance;
      }

      const diameterCursorDistance = Math.abs(centerCursorDistance - shape.radius);
      if (diameterCursorDistance < minDistance) {
        operation = CircleDrawStateOperation.RESIZE;
        shapeID = i;
        minDistance = diameterCursorDistance;
      }
    }

    if (minDistance > MAX_OPERATION_MOUSE_DISTANCE) {
      return null;
    }

    return { operation, shapeID };
  }

  public onMouseMove(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent,
    isLeftMouseDown: boolean
  ): RegionSelectorState {
    if (!isLeftMouseDown || this.operation === null || this.shapeIDToOperate === null) {
      return this;
    }
    if (this.operation === CircleDrawStateOperation.MOVE) {
      return this.onMouseMoveMove(canvas, event);
    }
    return this.onMouseMoveResize(canvas, event);
  }

  private onMouseMoveMove(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Circle)) {
      return this;
    }

    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );
    const newShape = new Circle(cursorImagePosition, shapeToOperate.radius);

    const newContent = { ...this.content };
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToOperate || 0] = newShape;

    return new CircleDrawState(
      newContent,
      this.regionIDToEdit,
      this.operation,
      this.shapeIDToOperate,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private onMouseMoveResize(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Circle)) {
      return this;
    }

    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );
    const newRadius = this.geometryService.getDistance(cursorImagePosition, shapeToOperate.center);
    const newShape = new Circle(shapeToOperate.center, newRadius);

    const newContent = { ...this.content };
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToOperate || 0] = newShape;

    return new CircleDrawState(
      newContent,
      this.regionIDToEdit,
      this.operation,
      this.shapeIDToOperate,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  public onLeftMouseUp(): RegionSelectorState {
    this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(this.content.drawnShapeList));
    return new CircleDrawState(
      this.content,
      this.regionIDToEdit,
      null,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  public onDraw(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      return null;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    this.canvasGraphicService.clearCanvas({ ctx, canvasWidth, canvasHeight });
    this.canvasGraphicService.drawCheckerboard({
      ctx,
      canvasWidth,
      canvasHeight,
      cellSize: 32,
      blackColor: '#ccc',
      whiteColor: '#fff',
    });

    if (!this.content.image) {
      return ctx;
    }
    const imageDrawRegion = this.regionSelectorGeometryService.calculateImageDrawRegion(canvas, this.content);
    ctx.drawImage(this.content.image, imageDrawRegion.dx, imageDrawRegion.dy, imageDrawRegion.dw, imageDrawRegion.dh);

    if (this.content.isRegionListVisible) {
      this.content.regionList.forEach((_, index) => {
        if (index === this.regionIDToEdit) {
          return;
        }
        this.regionSelectorGraphicService.drawRegion(canvas, ctx, this.content, index);
      });
    }

    this.regionSelectorGraphicService.drawDrawnShapeList(canvas, canvasWidth, canvasHeight, ctx, this.content);

    switch (this.operation) {
      case CircleDrawStateOperation.MOVE:
        this.onDrawMove(canvas, canvasWidth, canvasHeight, ctx);
        break;
      case CircleDrawStateOperation.RESIZE:
        this.onDrawResize(canvas, canvasWidth, canvasHeight, ctx);
        break;
      default:
        canvas.style.cursor = 'crosshair';
        break;
    }

    return ctx;
  }

  private onDrawMove(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Circle)) {
      return;
    }
    const canvasShapeCenter = this.regionSelectorGeometryService.imageToCanvasPosition(
      canvas,
      this.content,
      shapeToOperate.center
    );
    this.canvasGraphicService.drawCircle({
      canvasWidth,
      canvasHeight,
      ctx,
      center: canvasShapeCenter,
      lineColor: '#f5222d',
      fillColor: '#a8071a',
      radius: 5,
    });
    canvas.style.cursor = 'move';
  }

  private onDrawResize(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Circle)) {
      return;
    }
    const canvasShape = this.regionSelectorGeometryService.imageToCanvasShape(canvas, this.content, shapeToOperate);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.setLineDash([4, 4]);
    canvasShape.draw(canvasWidth, canvasHeight, ctx);
    this.canvasGraphicService.clearContext(ctx);
    canvas.style.cursor = 'crosshair';
  }
}
