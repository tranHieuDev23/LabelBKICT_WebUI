import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { FreePolygon, Eclipse, Rectangle } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { DRAWN_POLYGON_COLOR_LIST, VERTICES_MAX_DISTANCE } from './constants';
import { RegionSelectorState } from './region-selector-state';

export abstract class EditState implements RegionSelectorState {
  constructor(
    public readonly content: RegionSelectorContent,
    public readonly regionIDToEdit: number | null,
    protected readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    protected readonly geometryService: GeometryService,
    protected readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    protected readonly canvasGraphicService: CanvasGraphicService
  ) {}

  public abstract onLeftMouseDown(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState;
  public abstract onMouseMove(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent,
    isLeftMouseDown: boolean
  ): RegionSelectorState;
  public abstract onLeftMouseUp(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState;

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

    this.drawDrawnShapeList(canvas, canvasWidth, canvasHeight, ctx, this.content);

    return ctx;
  }

  public drawDrawnShapeList(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent
  ): void {
    for (let i = 0; i < content.drawnShapeList.length; i++) {
      const shape = content.drawnShapeList[i];
      const shapeColor = DRAWN_POLYGON_COLOR_LIST[Math.min(i, DRAWN_POLYGON_COLOR_LIST.length - 1)];

      if (shape instanceof FreePolygon) {
        this.drawDrawnFreePolygon(canvas, canvasWidth, canvasHeight, ctx, content, shape, shapeColor);
        continue;
      }

      if (shape instanceof Eclipse) {
        this.drawDrawnEclipse(canvas, canvasWidth, canvasHeight, ctx, content, shape, shapeColor);
      }

      if (shape instanceof Rectangle) {
        this.drawDrawnRectangle(canvas, canvasWidth, canvasHeight, ctx, content, shape, shapeColor);
      }
    }
  }

  private drawDrawnFreePolygon(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    polygon: FreePolygon,
    color: string
  ): void {
    const vertices = polygon.getVertices();
    let lastVertex = vertices[vertices.length - 1];
    let lastVertexCanvasPos = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, lastVertex);
    for (const vertex of vertices) {
      const vertexCanvasPos = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, vertex);
      this.canvasGraphicService.drawCircle({
        canvasWidth,
        canvasHeight,
        ctx,
        center: vertexCanvasPos,
        radius: 1,
        lineColor: color,
        fillColor: color,
      });

      if (this.geometryService.getDistance(lastVertex, vertex) <= VERTICES_MAX_DISTANCE) {
        this.canvasGraphicService.drawLine({
          canvasWidth,
          canvasHeight,
          ctx,
          lineStart: lastVertexCanvasPos,
          lineEnd: vertexCanvasPos,
          lineColor: color,
        });
      }

      lastVertex = vertex;
      lastVertexCanvasPos = vertexCanvasPos;
    }
  }

  private drawDrawnEclipse(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    eclipse: Eclipse,
    color: string
  ): void {
    const canvasShape = this.regionSelectorGeometryService.imageToCanvasShape(canvas, content, eclipse);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    canvasShape.draw(canvasWidth, canvasHeight, ctx);
    this.canvasGraphicService.clearContext(ctx);

    const canvasCenter = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, eclipse.center);
    this.canvasGraphicService.drawCircle({
      canvasHeight,
      canvasWidth,
      ctx,
      center: canvasCenter,
      radius: 2,
      lineColor: color,
    });
  }

  private drawDrawnRectangle(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    rectangle: Rectangle,
    color: string
  ): void {
    const canvasShape = this.regionSelectorGeometryService.imageToCanvasShape(canvas, content, rectangle);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    canvasShape.draw(canvasWidth, canvasHeight, ctx);
    this.canvasGraphicService.clearContext(ctx);

    for (const imagePosition of [
      rectangle.getCenter(),
      rectangle.getBottomLeft(),
      rectangle.getBottomRight(),
      rectangle.getTopLeft(),
      rectangle.getTopRight(),
      rectangle.getBottomMiddle(),
      rectangle.getTopMiddle(),
      rectangle.getMiddleLeft(),
      rectangle.getMiddleRight(),
    ]) {
      const canvasPosition = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, imagePosition);
      this.canvasGraphicService.drawCircle({
        canvasHeight,
        canvasWidth,
        ctx,
        center: canvasPosition,
        radius: 2,
        lineColor: color,
      });
    }
  }
}
