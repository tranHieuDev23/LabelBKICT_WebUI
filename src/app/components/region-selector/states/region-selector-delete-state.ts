import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { Coordinate, Eclipse, FreePolygon, Rectangle, Shape } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { VERTICES_MAX_DISTANCE, DELETE_VERTICES_MOUSE_DISTANCE } from './constants';
import { EditState } from './region-selector-edit-state';
import { RegionSelectorState } from './region-selector-state';

export class DeleteState extends EditState {
  constructor(
    public override readonly content: RegionSelectorContent,
    public override readonly regionIDToEdit: number | null,
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

  public onLeftMouseDown(): RegionSelectorState {
    return new DeleteState(
      this.content,
      this.regionIDToEdit,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
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

    if (!isLeftMouseDown) {
      const newContent = { ...this.content };
      newContent.cursorImagePosition = cursorImagePosition;
      return new DeleteState(
        newContent,
        this.regionIDToEdit,
        this.snapshotService,
        this.regionSelectorGeometryService,
        this.geometryService,
        this.regionSelectorGraphicService,
        this.canvasGraphicService
      );
    }

    const nonDeletedDrawnShapeList = this.getNonDeletedDrawnShapeList(canvas, cursorMousePosition, cursorImagePosition);
    const newContent = { ...this.content };
    newContent.cursorImagePosition = cursorImagePosition;
    newContent.drawnShapeList = nonDeletedDrawnShapeList;

    return new DeleteState(
      newContent,
      this.regionIDToEdit,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private getNonDeletedDrawnShapeList(
    canvas: HTMLCanvasElement,
    cursorMousePosition: Coordinate,
    cursorImagePosition: Coordinate
  ): Shape[] {
    const nonDeletedShapeList: Shape[] = [];
    for (const shape of this.content.drawnShapeList) {
      if (shape instanceof FreePolygon) {
        const nonDeletedFreePolygon = this.getNonDeletedFreePolygon(canvas, cursorMousePosition, shape);
        if (nonDeletedFreePolygon === null) {
          continue;
        }
        nonDeletedShapeList.push(nonDeletedFreePolygon);
        continue;
      }

      if (shape instanceof Eclipse) {
        if (!this.shouldDeleteEclipse(canvas, cursorImagePosition, shape)) {
          nonDeletedShapeList.push(shape);
        }
        continue;
      }

      if (shape instanceof Rectangle) {
        if (!this.shouldDeleteRectangle(canvas, cursorImagePosition, shape)) {
          nonDeletedShapeList.push(shape);
        }
        continue;
      }
    }
    return nonDeletedShapeList;
  }

  private getNonDeletedFreePolygon(
    canvas: HTMLCanvasElement,
    cursorMousePosition: Coordinate,
    polygon: FreePolygon
  ): Shape | null {
    const polygonVertices = polygon.getVertices();
    const newPolygonVertices = polygonVertices.filter((vertex) => {
      const vertexMousePos = this.regionSelectorGeometryService.imageToMousePosition(canvas, this.content, vertex);
      return this.geometryService.getDistance(vertexMousePos, cursorMousePosition) > DELETE_VERTICES_MOUSE_DISTANCE;
    });
    if (newPolygonVertices.length < 3) {
      return null;
    }
    return new FreePolygon(newPolygonVertices);
  }

  private shouldDeleteEclipse(canvas: HTMLCanvasElement, cursorImagePosition: Coordinate, eclipse: Eclipse): boolean {
    const mouseRadius = this.regionSelectorGeometryService.imageToMouseDistance(canvas, this.content, eclipse.center, {
      x: eclipse.center.x + eclipse.radiusX,
      y: eclipse.center.y,
    });
    const centerCursorDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      eclipse.center,
      cursorImagePosition
    );
    return Math.abs(centerCursorDistance - mouseRadius) <= DELETE_VERTICES_MOUSE_DISTANCE;
  }

  private shouldDeleteRectangle(
    canvas: HTMLCanvasElement,
    cursorImagePosition: Coordinate,
    rectangle: Rectangle
  ): boolean {
    const distanceToLeft = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      cursorImagePosition,
      { x: rectangle.left, y: cursorImagePosition.y }
    );
    if (
      distanceToLeft <= DELETE_VERTICES_MOUSE_DISTANCE &&
      rectangle.bottom <= cursorImagePosition.y &&
      cursorImagePosition.y <= rectangle.top
    ) {
      return true;
    }
    const distanceToRight = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      cursorImagePosition,
      { x: rectangle.right, y: cursorImagePosition.y }
    );
    if (
      distanceToRight <= DELETE_VERTICES_MOUSE_DISTANCE &&
      rectangle.bottom <= cursorImagePosition.y &&
      cursorImagePosition.y <= rectangle.top
    ) {
      return true;
    }
    const distanceToBottom = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      cursorImagePosition,
      { x: cursorImagePosition.x, y: rectangle.bottom }
    );
    if (
      distanceToBottom <= DELETE_VERTICES_MOUSE_DISTANCE &&
      rectangle.left <= cursorImagePosition.x &&
      cursorImagePosition.x <= rectangle.right
    ) {
      return true;
    }
    const distanceToTop = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      cursorImagePosition,
      { x: cursorImagePosition.x, y: rectangle.top }
    );
    if (
      distanceToTop <= DELETE_VERTICES_MOUSE_DISTANCE &&
      rectangle.left <= cursorImagePosition.x &&
      cursorImagePosition.x <= rectangle.right
    ) {
      return true;
    }
    return false;
  }

  public onLeftMouseUp(): RegionSelectorState {
    const cleanedDrawnShapeList = this.getCleanedDrawnShapeList();
    this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(cleanedDrawnShapeList));

    const newContent = { ...this.content };
    newContent.drawnShapeList = cleanedDrawnShapeList;
    return new DeleteState(
      newContent,
      this.regionIDToEdit,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private getCleanedDrawnShapeList(): Shape[] {
    // Remove all vertices with 2 openings
    const drawnShapeListWithNo2Openings = this.content.drawnShapeList.map((polygon) => {
      if (!(polygon instanceof FreePolygon)) {
        return polygon;
      }
      const polygonVertices = polygon.getVertices();
      const newPolygonVertices = polygonVertices.filter((vertex, index, vertices) => {
        const prevIndex = index === 0 ? vertices.length - 1 : index - 1;
        const prevVertex = vertices[prevIndex];
        const nextIndex = index === vertices.length - 1 ? 0 : index + 1;
        const nextVertex = vertices[nextIndex];
        return (
          this.geometryService.getDistance(vertex, prevVertex) <= VERTICES_MAX_DISTANCE ||
          this.geometryService.getDistance(vertex, nextVertex) <= VERTICES_MAX_DISTANCE
        );
      });
      return new FreePolygon(newPolygonVertices);
    });

    // Remove all empty polygon
    const drawnShapeListWithNoEmpty = drawnShapeListWithNo2Openings.filter((polygon) => {
      if (!(polygon instanceof FreePolygon)) {
        return true;
      }
      return polygon.getVertices().length > 0;
    });

    return drawnShapeListWithNoEmpty;
  }

  public override onDraw(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = super.onDraw(canvas);
    if (ctx === null) {
      return null;
    }
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    this.drawDeleteCursor(canvas, canvasWidth, canvasHeight, ctx);
    return ctx;
  }

  private drawDeleteCursor(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const cursorCanvasPos = this.regionSelectorGeometryService.imageToCanvasPosition(
      canvas,
      this.content,
      this.content.cursorImagePosition
    );
    this.canvasGraphicService.drawCircle({
      canvasWidth,
      canvasHeight,
      ctx,
      center: cursorCanvasPos,
      lineColor: '#ccc',
      radius: DELETE_VERTICES_MOUSE_DISTANCE,
    });
  }
}
