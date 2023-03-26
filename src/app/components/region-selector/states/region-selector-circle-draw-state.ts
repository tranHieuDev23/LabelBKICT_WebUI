import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { Coordinate, Eclipse, Shape } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { EditState } from './region-selector-edit-state';
import { RegionSelectorState } from './region-selector-state';

const MAX_OPERATION_MOUSE_DISTANCE = 10;

export enum CircleDrawStateOperation {
  MOVE = 0,
  RESIZE = 1,
}

export class CircleDrawState extends EditState {
  constructor(
    public override readonly content: RegionSelectorContent,
    public override readonly regionIDToEdit: number | null,
    public readonly operation: CircleDrawStateOperation | null,
    public readonly shapeIDToOperate: number | null,
    private readonly snapshotService: RegionSelectorSnapshotService,
    protected override readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    protected override readonly geometryService: GeometryService,
    protected override readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    protected override readonly canvasGraphicService: CanvasGraphicService
  ) {
    super(
      content,
      regionIDToEdit,
      regionSelectorGeometryService,
      geometryService,
      regionSelectorGraphicService,
      canvasGraphicService
    );
  }

  public onLeftMouseDown(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState {
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );

    const operationAndShapeIDToOperate = this.getOperationAndShapeIDToOperate(canvas, cursorImagePosition);
    if (operationAndShapeIDToOperate === null) {
      const newContent = { ...this.content };
      const shapeIDToOperate = newContent.drawnShapeList.length;
      newContent.drawnShapeList = [...newContent.drawnShapeList, new Eclipse(cursorImagePosition, 0, 0)];
      newContent.cursorImagePosition = cursorImagePosition;
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
    cursorImagePosition: Coordinate
  ): {
    operation: CircleDrawStateOperation;
    shapeID: number;
  } | null {
    let operation = CircleDrawStateOperation.MOVE;
    let shapeID = -1;
    let minDistance = Infinity;

    for (let i = 0; i < this.content.drawnShapeList.length; i++) {
      const shape = this.content.drawnShapeList[i];
      if (!(shape instanceof Eclipse)) {
        continue;
      }

      const centerCursorDistance = this.regionSelectorGeometryService.imageToMouseDistance(
        canvas,
        this.content,
        cursorImagePosition,
        shape.center
      );
      if (centerCursorDistance < minDistance) {
        operation = CircleDrawStateOperation.MOVE;
        shapeID = i;
        minDistance = centerCursorDistance;
      }

      const mouseRadius = this.regionSelectorGeometryService.imageToMouseDistance(canvas, this.content, shape.center, {
        x: shape.center.x + shape.radiusX,
        y: shape.center.y,
      });
      const diameterCursorDistance = Math.abs(centerCursorDistance - mouseRadius);
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
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );

    if (!isLeftMouseDown || this.operation === null || this.shapeIDToOperate === null) {
      const newContent = { ...this.content };
      newContent.cursorImagePosition = cursorImagePosition;
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

    if (this.operation === CircleDrawStateOperation.MOVE) {
      return this.onMouseMoveMove(cursorImagePosition);
    }

    return this.onMouseMoveResize(canvas, cursorImagePosition);
  }

  private onMouseMoveMove(cursorImagePosition: Coordinate): RegionSelectorState {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Eclipse)) {
      return this;
    }

    const newShape = new Eclipse(cursorImagePosition, shapeToOperate.radiusX, shapeToOperate.radiusY);

    const newContent = { ...this.content };
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToOperate || 0] = newShape;
    newContent.cursorImagePosition = cursorImagePosition;

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

  private onMouseMoveResize(canvas: HTMLCanvasElement, cursorImagePosition: Coordinate): RegionSelectorState {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Eclipse)) {
      return this;
    }

    const centerMousePosition = this.regionSelectorGeometryService.imageToMousePosition(
      canvas,
      this.content,
      shapeToOperate.center
    );
    const centerCursorDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      cursorImagePosition,
      shapeToOperate.center
    );
    const newRadiusX = this.regionSelectorGeometryService.mouseToImageDistance(
      canvas,
      this.content,
      centerMousePosition,
      { x: centerMousePosition.x + centerCursorDistance, y: centerMousePosition.y }
    );
    const newRadiusY = this.regionSelectorGeometryService.mouseToImageDistance(
      canvas,
      this.content,
      centerMousePosition,
      { x: centerMousePosition.x, y: centerMousePosition.y + centerCursorDistance }
    );
    const newShape = new Eclipse(shapeToOperate.center, newRadiusX, newRadiusY);

    const newContent = { ...this.content };
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToOperate || 0] = newShape;
    newContent.cursorImagePosition = cursorImagePosition;

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

  public onLeftMouseUp(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState {
    this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(this.content.drawnShapeList));

    const newContent = { ...this.content };
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );
    newContent.cursorImagePosition = cursorImagePosition;

    return new CircleDrawState(
      newContent,
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

  public override onDraw(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = super.onDraw(canvas);
    if (ctx === null) {
      return null;
    }
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (this.operation === CircleDrawStateOperation.MOVE) {
      const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
      this.onDrawMove(canvas, canvasWidth, canvasHeight, ctx, shapeToOperate);
    } else if (this.operation === CircleDrawStateOperation.RESIZE) {
      const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
      this.onDrawResize(canvas, canvasWidth, canvasHeight, ctx, shapeToOperate);
    } else {
      this.onDrawDefault(canvas, canvasWidth, canvasHeight, ctx);
    }
    return ctx;
  }

  private onDrawMove(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    shapeToOperate: Shape
  ): void {
    if (!(shapeToOperate instanceof Eclipse)) {
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
    ctx: CanvasRenderingContext2D,
    shapeToOperate: Shape
  ): void {
    if (!(shapeToOperate instanceof Eclipse)) {
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

  private onDrawDefault(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const operationAndShapeIDToOperate = this.getOperationAndShapeIDToOperate(canvas, this.content.cursorImagePosition);
    if (operationAndShapeIDToOperate === null) {
      canvas.style.cursor = 'crosshair';
      return;
    }

    const { operation, shapeID } = operationAndShapeIDToOperate;
    const shapeToOperate = this.content.drawnShapeList[shapeID];
    if (!(shapeToOperate instanceof Eclipse)) {
      canvas.style.cursor = 'crosshair';
      return;
    }

    if (operation === CircleDrawStateOperation.MOVE) {
      this.onDrawMove(canvas, canvasWidth, canvasHeight, ctx, shapeToOperate);
    } else {
      this.onDrawResize(canvas, canvasWidth, canvasHeight, ctx, shapeToOperate);
    }
  }
}
