import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { Circle, Coordinate, FreePolygon, Shape } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { VERTICES_MAX_DISTANCE, DELETE_VERTICES_MOUSE_DISTANCE } from './constants';
import { RegionSelectorState } from './region-selector-state';

export class DeleteState implements RegionSelectorState {
  constructor(
    public readonly content: RegionSelectorContent,
    public readonly regionIDToEdit: number | null,
    private readonly snapshotService: RegionSelectorSnapshotService,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly geometryService: GeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {}

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

      if (shape instanceof Circle) {
        if (!this.shouldDeleteCircle(canvas, cursorImagePosition, shape)) {
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

  private shouldDeleteCircle(canvas: HTMLCanvasElement, cursorImagePosition: Coordinate, circle: Circle): boolean {
    const mouseCircleRadius = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      circle.center,
      { x: circle.center.x, y: circle.center.y + circle.radius }
    );
    const mouseCircleCenterCursorDistance = this.regionSelectorGeometryService.imageToMouseDistance(
      canvas,
      this.content,
      circle.center,
      cursorImagePosition
    );
    return Math.abs(mouseCircleCenterCursorDistance - mouseCircleRadius) <= DELETE_VERTICES_MOUSE_DISTANCE;
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
