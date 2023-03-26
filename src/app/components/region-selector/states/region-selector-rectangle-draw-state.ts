import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { Coordinate, Rectangle, Shape } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { EditState } from './region-selector-edit-state';
import { RegionSelectorState } from './region-selector-state';

const MAX_OPERATION_MOUSE_DISTANCE = 10;

export enum RectangleDrawStateOperation {
  DRAW = 0,
  MOVE = 1,
  RESIZE_LEFT = 2,
  RESIZE_RIGHT = 3,
  RESIZE_BOTTOM = 4,
  RESIZE_TOP = 5,
  RESIZE_BOTTOM_LEFT = 6,
  RESIZE_BOTTOM_RIGHT = 7,
  RESIZE_TOP_LEFT = 8,
  RESIZE_TOP_RIGHT = 9,
}

interface GetPositionFuncAndCursor {
  getPosition(rectangle: Rectangle): Coordinate;
  cursor: string;
}

const OPERATION_TO_GET_POSITION_FUNC_AND_CURSOR = new Map<RectangleDrawStateOperation, GetPositionFuncAndCursor>([
  [
    RectangleDrawStateOperation.MOVE,
    {
      getPosition(rectangle) {
        return rectangle.getCenter();
      },
      cursor: 'move',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_LEFT,
    {
      getPosition(rectangle) {
        return rectangle.getMiddleLeft();
      },
      cursor: 'ew-resize',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_RIGHT,
    {
      getPosition(rectangle) {
        return rectangle.getMiddleRight();
      },

      cursor: 'ew-resize',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_BOTTOM,
    {
      getPosition(rectangle) {
        return rectangle.getBottomMiddle();
      },
      cursor: 'ns-resize',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_TOP,
    {
      getPosition(rectangle) {
        return rectangle.getTopMiddle();
      },
      cursor: 'ns-resize',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_BOTTOM_LEFT,
    {
      getPosition(rectangle) {
        return rectangle.getBottomLeft();
      },
      cursor: 'nwse-resize',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_BOTTOM_RIGHT,
    {
      getPosition(rectangle) {
        return rectangle.getBottomRight();
      },
      cursor: 'nesw-resize',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_TOP_LEFT,
    {
      getPosition(rectangle) {
        return rectangle.getTopLeft();
      },
      cursor: 'nesw-resize',
    },
  ],
  [
    RectangleDrawStateOperation.RESIZE_TOP_RIGHT,
    {
      getPosition(rectangle) {
        return rectangle.getTopRight();
      },
      cursor: 'nwse-resize',
    },
  ],
]);

export class RectangleDrawState extends EditState {
  constructor(
    public override readonly content: RegionSelectorContent,
    public override readonly regionIDToEdit: number | null,
    public readonly operation: RectangleDrawStateOperation | null,
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
      const shapeToOperate = new Rectangle(
        cursorImagePosition.x,
        cursorImagePosition.x,
        cursorImagePosition.y,
        cursorImagePosition.y
      );
      newContent.drawnShapeList = [...newContent.drawnShapeList, shapeToOperate];
      newContent.cursorImagePosition = cursorImagePosition;
      return new RectangleDrawState(
        newContent,
        this.regionIDToEdit,
        RectangleDrawStateOperation.DRAW,
        shapeIDToOperate,
        this.snapshotService,
        this.regionSelectorGeometryService,
        this.geometryService,
        this.regionSelectorGraphicService,
        this.canvasGraphicService
      );
    }

    const { operation, shapeID } = operationAndShapeIDToOperate;
    return new RectangleDrawState(
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
    operation: RectangleDrawStateOperation;
    shapeID: number;
  } | null {
    let operation = RectangleDrawStateOperation.MOVE;
    let shapeID = -1;
    let minDistance = Infinity;

    for (let i = 0; i < this.content.drawnShapeList.length; i++) {
      const shape = this.content.drawnShapeList[i];
      if (!(shape instanceof Rectangle)) {
        continue;
      }

      for (const [operationKey, itemValue] of OPERATION_TO_GET_POSITION_FUNC_AND_CURSOR.entries()) {
        const imagePosition = itemValue.getPosition(shape);
        const positionCursorDistance = this.regionSelectorGeometryService.imageToMouseDistance(
          canvas,
          this.content,
          imagePosition,
          cursorImagePosition
        );
        if (positionCursorDistance < minDistance) {
          operation = operationKey;
          shapeID = i;
          minDistance = positionCursorDistance;
        }
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
      return new RectangleDrawState(
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

    if (this.operation === RectangleDrawStateOperation.DRAW) {
      return this.onMouseMoveDraw(cursorImagePosition);
    }

    if (this.operation === RectangleDrawStateOperation.MOVE) {
      return this.onMouseMoveMove(cursorImagePosition);
    }

    return this.onMouseMoveResize(cursorImagePosition);
  }

  private onMouseMoveDraw(cursorImagePosition: Coordinate): RegionSelectorState {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Rectangle)) {
      return this;
    }

    const newShape = new Rectangle(
      shapeToOperate.left,
      cursorImagePosition.x,
      shapeToOperate.bottom,
      cursorImagePosition.y
    );

    const newContent = { ...this.content };
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToOperate || 0] = newShape;
    newContent.cursorImagePosition = cursorImagePosition;

    return new RectangleDrawState(
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

  private onMouseMoveMove(cursorImagePosition: Coordinate): RegionSelectorState {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Rectangle)) {
      return this;
    }

    const shapeCenter = shapeToOperate.getCenter();
    const deltaX = cursorImagePosition.x - shapeCenter.x;
    const deltaY = cursorImagePosition.y - shapeCenter.y;
    const newShape = new Rectangle(
      shapeToOperate.left + deltaX,
      shapeToOperate.right + deltaX,
      shapeToOperate.bottom + deltaY,
      shapeToOperate.top + deltaY
    );

    const newContent = { ...this.content };
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToOperate || 0] = newShape;
    newContent.cursorImagePosition = cursorImagePosition;

    return new RectangleDrawState(
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

  private onMouseMoveResize(cursorImagePosition: Coordinate): RegionSelectorState {
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Rectangle)) {
      return this;
    }

    const newLeft =
      this.operation === RectangleDrawStateOperation.RESIZE_LEFT ||
      this.operation === RectangleDrawStateOperation.RESIZE_BOTTOM_LEFT ||
      this.operation === RectangleDrawStateOperation.RESIZE_TOP_LEFT
        ? cursorImagePosition.x
        : shapeToOperate.left;
    const newRight =
      this.operation === RectangleDrawStateOperation.RESIZE_RIGHT ||
      this.operation === RectangleDrawStateOperation.RESIZE_BOTTOM_RIGHT ||
      this.operation === RectangleDrawStateOperation.RESIZE_TOP_RIGHT
        ? cursorImagePosition.x
        : shapeToOperate.right;
    const newBottom =
      this.operation === RectangleDrawStateOperation.RESIZE_BOTTOM ||
      this.operation === RectangleDrawStateOperation.RESIZE_BOTTOM_LEFT ||
      this.operation === RectangleDrawStateOperation.RESIZE_BOTTOM_RIGHT
        ? cursorImagePosition.y
        : shapeToOperate.bottom;
    const newTop =
      this.operation === RectangleDrawStateOperation.RESIZE_TOP ||
      this.operation === RectangleDrawStateOperation.RESIZE_TOP_LEFT ||
      this.operation === RectangleDrawStateOperation.RESIZE_TOP_RIGHT
        ? cursorImagePosition.y
        : shapeToOperate.top;
    const newShape = new Rectangle(newLeft, newRight, newBottom, newTop);

    const newContent = { ...this.content };
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToOperate || 0] = newShape;
    newContent.cursorImagePosition = cursorImagePosition;

    return new RectangleDrawState(
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
    const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
    if (!(shapeToOperate instanceof Rectangle)) {
      return this;
    }

    const newShape = shapeToOperate.getNormalizedRectangle();
    const newDrawnShapeList = [...this.content.drawnShapeList];
    newDrawnShapeList[this.shapeIDToOperate || 0] = newShape;

    this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(newDrawnShapeList));

    const newContent = { ...this.content };
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );
    newContent.drawnShapeList = newDrawnShapeList;
    newContent.cursorImagePosition = cursorImagePosition;

    return new RectangleDrawState(
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
    if (this.operation === null) {
      this.onDrawDefault(canvas, canvasWidth, canvasHeight, ctx);
    } else {
      const shapeToOperate = this.content.drawnShapeList[this.shapeIDToOperate || 0];
      this.onDrawOperationPosition(canvas, canvasWidth, canvasHeight, ctx, this.operation, shapeToOperate);
    }
    return ctx;
  }

  private onDrawOperationPosition(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    operation: RectangleDrawStateOperation,
    shapeToOperate: Shape
  ): void {
    if (!(shapeToOperate instanceof Rectangle)) {
      return;
    }

    const getPositionFuncAndCursor = OPERATION_TO_GET_POSITION_FUNC_AND_CURSOR.get(operation);
    if (getPositionFuncAndCursor === undefined) {
      return;
    }

    const imagePosition = getPositionFuncAndCursor.getPosition(shapeToOperate);
    const canvasPosition = this.regionSelectorGeometryService.imageToCanvasPosition(
      canvas,
      this.content,
      imagePosition
    );
    this.canvasGraphicService.drawCircle({
      canvasWidth,
      canvasHeight,
      ctx,
      center: canvasPosition,
      lineColor: '#f5222d',
      fillColor: '#a8071a',
      radius: 5,
    });

    canvas.style.cursor = getPositionFuncAndCursor.cursor;
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
    if (!(shapeToOperate instanceof Rectangle)) {
      canvas.style.cursor = 'crosshair';
      return;
    }

    this.onDrawOperationPosition(canvas, canvasWidth, canvasHeight, ctx, operation, shapeToOperate);
  }
}
