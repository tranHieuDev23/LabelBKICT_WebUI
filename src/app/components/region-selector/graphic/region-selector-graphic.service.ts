import { Injectable } from '@angular/core';
import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { RegionSelectorContent } from '../region-selector-content';
import { CanvasGraphicService } from './canvas-graphic.service';
import { ColorService } from './color.service';

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

  private drawRegion(
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

    const borderCanvasPolygon = {
      vertices: region.border.vertices.map((vertex) =>
        this.regionSelectorGeometryService.imageToCanvasPosition(
          canvas,
          content,
          vertex
        )
      ),
    };
    this.canvasGraphicService.drawPolygon({
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      ctx: ctx,
      polygon: borderCanvasPolygon,
      lineColor: regionLabelColor,
    });

    for (const hole of region.holes) {
      const holeCanvasPolygon = {
        vertices: hole.vertices.map((vertex) =>
          this.regionSelectorGeometryService.imageToCanvasPosition(
            canvas,
            content,
            vertex
          )
        ),
      };
      this.canvasGraphicService.drawPolygon({
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        ctx: ctx,
        polygon: holeCanvasPolygon,
        lineColor: regionLabelColor,
        fillColor:
          this.colorService.getTransparentVersionOfColor(regionLabelColor),
      });
    }
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

    const borderCanvasPolygon = {
      vertices: region.border.vertices.map((vertex) =>
        this.regionSelectorGeometryService.imageToCanvasPosition(
          canvas,
          content,
          vertex
        )
      ),
    };
    const borderCanvasBoundingBox =
      this.geometryService.getPolygonBoundingBox(borderCanvasPolygon);
    const borderCanvasBoundingBoxCenter = {
      x: borderCanvasBoundingBox.dx + borderCanvasBoundingBox.dw / 2,
      y: borderCanvasBoundingBox.dy + borderCanvasBoundingBox.dh / 2,
    };

    const regionLabelDisplayName = region.label?.displayName || 'Not labeled';
    const regionLabelColor = region.label?.color || DEFAULT_REGION_LABEL_COLOR;
    const fontSize = REGION_LABEL_DISPLAY_NAME_FONT_SIZE * content.zoom;

    this.canvasGraphicService.drawTextBox({
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      ctx: ctx,
      textBoxCenter: borderCanvasBoundingBoxCenter,
      boxColor: regionLabelColor,
      text: regionLabelDisplayName,
      fontSize: fontSize,
      font: 'sans-serif',
      textColor: '#fff',
    });
  }
}
