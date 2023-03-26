import { Injectable } from '@angular/core';
import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { FreePolygon } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { CanvasGraphicService } from './canvas-graphic.service';
import { ColorService } from './color.service';

const VERTICES_MAX_DISTANCE = 1e-2;
const DRAWN_POLYGON_COLOR_LIST = ['#c41d7f', '#531dab', '#096dd9', '#faad14', '#d4380d', '#08979c'];
const DEFAULT_REGION_LABEL_COLOR = '#13c2c2';
const REGION_LABEL_DISPLAY_NAME_FONT_SIZE = 16;

@Injectable({
  providedIn: 'root',
})
export class RegionSelectorGraphicService {
  constructor(
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly geometryService: GeometryService,
    private readonly canvasGraphicService: CanvasGraphicService,
    private readonly colorService: ColorService
  ) {}

  public drawRegionList(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent
  ): void {
    for (let i = 0; i < content.regionList.length; i++) {
      this.drawRegion(canvas, ctx, content, i);
    }
  }

  public drawRegion(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    regionIndex: number
  ): void {
    if (regionIndex < 0 || regionIndex > content.regionList.length) {
      return;
    }
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const region = content.regionList[regionIndex];
    const regionLabelColor = region.label?.color || DEFAULT_REGION_LABEL_COLOR;

    const borderCanvasShape = this.regionSelectorGeometryService.imageToCanvasShape(
      canvas,
      content,
      new FreePolygon(region.border.vertices)
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = regionLabelColor;
    borderCanvasShape.draw(canvasWidth, canvasHeight, ctx);
    this.canvasGraphicService.clearContext(ctx);

    ctx.lineWidth = 2;
    ctx.strokeStyle = regionLabelColor;
    ctx.fillStyle = this.colorService.getTransparentVersionOfColor(regionLabelColor);
    for (const hole of region.holes) {
      const holeCanvasShape = this.regionSelectorGeometryService.imageToCanvasShape(
        canvas,
        content,
        new FreePolygon(hole.vertices)
      );
      holeCanvasShape.draw(canvasWidth, canvasHeight, ctx);
    }
    this.canvasGraphicService.clearContext(ctx);
  }

  public drawRegionLabel(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    regionIndex: number
  ): void {
    if (regionIndex < 0 || regionIndex > content.regionList.length) {
      return;
    }
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const region = content.regionList[regionIndex];

    const borderCanvasVertices = region.border.vertices.map((vertex) =>
      this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, vertex)
    );
    const borderCanvasShape = new FreePolygon(borderCanvasVertices);
    const borderCanvasShapeCenter = this.geometryService.getShapeCenter(borderCanvasShape);

    const regionLabelDisplayName = region.label?.displayName || 'Not labeled';
    const regionLabelColor = region.label?.color || DEFAULT_REGION_LABEL_COLOR;
    const fontSize = REGION_LABEL_DISPLAY_NAME_FONT_SIZE * content.zoom;

    this.canvasGraphicService.drawTextBox({
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      ctx: ctx,
      textBoxCenter: borderCanvasShapeCenter,
      boxColor: regionLabelColor,
      text: regionLabelDisplayName,
      fontSize: fontSize,
      font: 'sans-serif',
      textColor: '#fff',
    });
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
      if (shape instanceof FreePolygon) {
        this.drawDrawnFreePolygon(canvas, canvasWidth, canvasHeight, ctx, content, i, shape);
        continue;
      }

      const canvasShape = this.regionSelectorGeometryService.imageToCanvasShape(canvas, content, shape);
      const shapeColor = DRAWN_POLYGON_COLOR_LIST[Math.min(i, DRAWN_POLYGON_COLOR_LIST.length - 1)];
      ctx.lineWidth = 2;
      ctx.strokeStyle = shapeColor;
      canvasShape.draw(canvasWidth, canvasHeight, ctx);
      this.canvasGraphicService.clearContext(ctx);
    }
  }

  private drawDrawnFreePolygon(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    index: number,
    polygon: FreePolygon
  ): void {
    const polygonVertices = polygon.getVertices();
    const polygonColor = DRAWN_POLYGON_COLOR_LIST[Math.min(index, DRAWN_POLYGON_COLOR_LIST.length - 1)];

    let lastVertex = polygonVertices[polygonVertices.length - 1];
    let lastVertexCanvasPos = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, lastVertex);

    for (const vertex of polygonVertices) {
      const vertexCanvasPos = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, vertex);
      this.canvasGraphicService.drawCircle({
        canvasWidth,
        canvasHeight,
        ctx,
        center: vertexCanvasPos,
        radius: 1,
        lineColor: polygonColor,
        fillColor: polygonColor,
      });

      if (this.geometryService.getDistance(lastVertex, vertex) <= VERTICES_MAX_DISTANCE) {
        this.canvasGraphicService.drawLine({
          canvasWidth,
          canvasHeight,
          ctx,
          lineStart: lastVertexCanvasPos,
          lineEnd: vertexCanvasPos,
          lineColor: polygonColor,
        });
      }

      lastVertex = vertex;
      lastVertexCanvasPos = vertexCanvasPos;
    }
  }
}
