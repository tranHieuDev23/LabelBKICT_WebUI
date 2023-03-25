import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { FreePolygon } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { RegionSelectorState } from './region-selector-state';

const VERTICES_MAX_DISTANCE = 1e-2;
const DELETE_VERTICES_MOUSE_DISTANCE = 10;
const DRAWN_POLYGON_COLOR_LIST = [
  '#c41d7f',
  '#531dab',
  '#096dd9',
  '#faad14',
  '#d4380d',
  '#08979c',
];

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
    const cursorMousePosition =
      this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition =
      this.regionSelectorGeometryService.mouseToImagePosition(
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

    // Remove all vertices within cursor size
    const drawnShapeListWithNo2Openings = this.content.drawnShapeList.map(
      (polygon) => {
        if (!(polygon instanceof FreePolygon)) {
          return polygon;
        }
        const polygonVertices = polygon.getVertices();
        const newPolygonVertices = polygonVertices.filter((vertex) => {
          const vertexMousePos =
            this.regionSelectorGeometryService.imageToMousePosition(
              canvas,
              this.content,
              vertex
            );
          return (
            this.geometryService.getDistance(
              vertexMousePos,
              cursorMousePosition
            ) > DELETE_VERTICES_MOUSE_DISTANCE
          );
        });
        return new FreePolygon(newPolygonVertices);
      }
    );

    // Remove all empty polygon
    const drawnShapeListWithNoEmpty = drawnShapeListWithNo2Openings.filter(
      (polygon) => {
        if (!(polygon instanceof FreePolygon)) {
          return true;
        }
        return polygon.getVertices().length > 0;
      }
    );

    const newContent = { ...this.content };
    newContent.cursorImagePosition = cursorImagePosition;
    newContent.drawnShapeList = drawnShapeListWithNoEmpty;

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

  public onLeftMouseUp(): RegionSelectorState {
    // Remove all vertices with 2 openings
    const drawnShapeListWithNo2Openings = this.content.drawnShapeList.map(
      (polygon) => {
        if (!(polygon instanceof FreePolygon)) {
          return polygon;
        }
        const polygonVertices = polygon.getVertices();
        const newPolygonVertices = polygonVertices.filter(
          (vertex, index, vertices) => {
            const prevIndex = index === 0 ? vertices.length - 1 : index - 1;
            const prevVertex = vertices[prevIndex];
            const nextIndex = index === vertices.length - 1 ? 0 : index + 1;
            const nextVertex = vertices[nextIndex];
            return (
              this.geometryService.getDistance(vertex, prevVertex) <=
                VERTICES_MAX_DISTANCE ||
              this.geometryService.getDistance(vertex, nextVertex) <=
                VERTICES_MAX_DISTANCE
            );
          }
        );
        return new FreePolygon(newPolygonVertices);
      }
    );

    // Remove all empty polygon
    const drawnShapeListWithNoEmpty = drawnShapeListWithNo2Openings.filter(
      (polygon) => {
        if (!(polygon instanceof FreePolygon)) {
          return true;
        }
        return polygon.getVertices().length > 0;
      }
    );

    this.snapshotService.storeSnapshot(
      new RegionSelectorSnapshot(drawnShapeListWithNoEmpty)
    );

    const newContent = { ...this.content };
    newContent.drawnShapeList = drawnShapeListWithNoEmpty;
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
    const imageDrawRegion =
      this.regionSelectorGeometryService.calculateImageDrawRegion(
        canvas,
        this.content
      );
    ctx.drawImage(
      this.content.image,
      imageDrawRegion.dx,
      imageDrawRegion.dy,
      imageDrawRegion.dw,
      imageDrawRegion.dh
    );

    if (this.content.isRegionListVisible) {
      this.content.regionList.forEach((_, index) => {
        if (index === this.regionIDToEdit) {
          return;
        }
        this.regionSelectorGraphicService.drawRegion(
          canvas,
          ctx,
          this.content,
          index
        );
      });
    }

    this.drawDrawnShapeList(canvas, canvasWidth, canvasHeight, ctx);
    this.drawDeleteCursor(canvas, canvasWidth, canvasHeight, ctx);

    return ctx;
  }

  private drawDrawnShapeList(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    for (let i = 0; i < this.content.drawnShapeList.length; i++) {
      const polygon = this.content.drawnShapeList[i];
      if (!(polygon instanceof FreePolygon)) {
        continue;
      }

      const polygonVertices = polygon.getVertices();
      const regionColor =
        DRAWN_POLYGON_COLOR_LIST[
          Math.min(i, DRAWN_POLYGON_COLOR_LIST.length - 1)
        ];

      let lastVertex = polygonVertices[polygonVertices.length - 1];
      let lastVertexCanvasPos =
        this.regionSelectorGeometryService.imageToCanvasPosition(
          canvas,
          this.content,
          lastVertex
        );

      for (const vertex of polygonVertices) {
        const vertexCanvasPos =
          this.regionSelectorGeometryService.imageToCanvasPosition(
            canvas,
            this.content,
            vertex
          );
        this.canvasGraphicService.drawCircle({
          canvasWidth,
          canvasHeight,
          ctx,
          center: vertexCanvasPos,
          radius: 1,
          lineColor: regionColor,
          fillColor: regionColor,
        });

        if (
          this.geometryService.getDistance(lastVertex, vertex) <=
          VERTICES_MAX_DISTANCE
        ) {
          this.canvasGraphicService.drawLine({
            canvasWidth,
            canvasHeight,
            ctx,
            lineStart: lastVertexCanvasPos,
            lineEnd: vertexCanvasPos,
            lineColor: regionColor,
          });
        }

        lastVertex = vertex;
        lastVertexCanvasPos = vertexCanvasPos;
      }
    }
  }

  private drawDeleteCursor(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const cursorCanvasPos =
      this.regionSelectorGeometryService.imageToCanvasPosition(
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
