import { Injectable } from '@angular/core';
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
    const borderCanvasShapeCenter = borderCanvasShape.getCenter();

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
}
