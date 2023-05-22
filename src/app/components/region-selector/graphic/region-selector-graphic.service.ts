import { Injectable } from '@angular/core';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { Eclipse, FreePolygon } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { CanvasGraphicService } from './canvas-graphic.service';
import { ColorService } from './color.service';
import { RegionSelectorElement } from '../common/constants';

const DEFAULT_REGION_LABEL_COLOR = '#13c2c2';
const REGION_LABEL_DISPLAY_NAME_FONT_SIZE = 16;
const DRAW_MARGIN_BOUNDARY_SEGMENT_LIST = [12, 3, 3];
const DRAW_MARGIN_BOUNDARY_MOUSE_NOT_OVER_COLOR = '#2196f3';
const DRAW_MARGIN_BOUNDARY_MOUSE_OVER_COLOR = '#f5222d';
const DRAW_MARGIN_BOUNDARY_MASK_COLOR = '#00000077';

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

  public drawDrawMargin(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    mouseOverElement: RegionSelectorElement | null
  ): void {
    if (!content.drawMarginEnabled) {
      return;
    }

    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;

    const canvasLeftMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
      x: content.drawMargin.left,
      y: 0,
    }).x;
    const canvasRightMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
      x: content.drawMargin.right,
      y: 0,
    }).x;
    const canvasBottomMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
      x: 0,
      y: content.drawMargin.bottom,
    }).y;
    const canvasTopMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
      x: 0,
      y: content.drawMargin.top,
    }).y;

    this.canvasGraphicService.drawLine({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth,
      ctx: ctx,
      strokeStyle: this.getDrawMarginAndBoundaryStrokeStyle(
        mouseOverElement === RegionSelectorElement.DRAW_MARGIN_LEFT
      ),
      lineStart: { x: canvasLeftMargin, y: 0 },
      lineEnd: { x: canvasLeftMargin, y: 1 },
      dashSegments: DRAW_MARGIN_BOUNDARY_SEGMENT_LIST,
    });
    this.canvasGraphicService.drawLine({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth,
      ctx: ctx,
      strokeStyle: this.getDrawMarginAndBoundaryStrokeStyle(
        mouseOverElement === RegionSelectorElement.DRAW_MARGIN_RIGHT
      ),
      lineStart: { x: canvasRightMargin, y: 0 },
      lineEnd: { x: canvasRightMargin, y: 1 },
      dashSegments: DRAW_MARGIN_BOUNDARY_SEGMENT_LIST,
    });
    this.canvasGraphicService.drawLine({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth,
      ctx: ctx,
      strokeStyle: this.getDrawMarginAndBoundaryStrokeStyle(
        mouseOverElement === RegionSelectorElement.DRAW_MARGIN_BOTTOM
      ),
      lineStart: { x: 0, y: canvasBottomMargin },
      lineEnd: { x: 1, y: canvasBottomMargin },
      dashSegments: DRAW_MARGIN_BOUNDARY_SEGMENT_LIST,
    });
    this.canvasGraphicService.drawLine({
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth,
      ctx: ctx,
      strokeStyle: this.getDrawMarginAndBoundaryStrokeStyle(mouseOverElement === RegionSelectorElement.DRAW_MARGIN_TOP),
      lineStart: { x: 0, y: canvasTopMargin },
      lineEnd: { x: 1, y: canvasTopMargin },
      dashSegments: DRAW_MARGIN_BOUNDARY_SEGMENT_LIST,
    });
  }

  public drawDrawBoundary(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent,
    mouseOverElement: RegionSelectorElement | null
  ): void {
    if (!content.drawBoundaryEnabled) {
      return;
    }

    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;

    const canvasBoundary = this.regionSelectorGeometryService.imageToCanvasShape(canvas, content, content.drawBoundary);
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.getDrawMarginAndBoundaryStrokeStyle(
      mouseOverElement === RegionSelectorElement.DRAW_BOUNDARY
    );
    ctx.setLineDash(DRAW_MARGIN_BOUNDARY_SEGMENT_LIST);
    canvasBoundary.draw(canvasWidth, canvasHeight, ctx);
    this.canvasGraphicService.clearContext(ctx);
  }

  private getDrawMarginAndBoundaryStrokeStyle(isMouseOver: boolean): string {
    if (!isMouseOver) {
      return DRAW_MARGIN_BOUNDARY_MOUSE_NOT_OVER_COLOR;
    }

    return DRAW_MARGIN_BOUNDARY_MOUSE_OVER_COLOR;
  }

  public drawMarginAndBoundaryMask(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    content: RegionSelectorContent
  ): void {
    if (!content.drawBoundaryEnabled && !content.drawMarginEnabled) {
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (content.drawMarginEnabled) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvasWidth, 0);
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.lineTo(0, 0);
      ctx.closePath();

      const canvasLeftMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
        x: content.drawMargin.left,
        y: 0,
      }).x;
      const canvasRightMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
        x: content.drawMargin.right,
        y: 0,
      }).x;
      const canvasBottomMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
        x: 0,
        y: content.drawMargin.bottom,
      }).y;
      const canvasTopMargin = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, content, {
        x: 0,
        y: content.drawMargin.top,
      }).y;

      ctx.moveTo(canvasLeftMargin * canvasWidth, canvasBottomMargin * canvasHeight);
      ctx.lineTo(canvasLeftMargin * canvasWidth, canvasTopMargin * canvasHeight);
      ctx.lineTo(canvasRightMargin * canvasWidth, canvasTopMargin * canvasHeight);
      ctx.lineTo(canvasRightMargin * canvasWidth, canvasBottomMargin * canvasHeight);
      ctx.lineTo(canvasLeftMargin * canvasWidth, canvasBottomMargin * canvasHeight);
      ctx.closePath();

      ctx.fillStyle = DRAW_MARGIN_BOUNDARY_MASK_COLOR;
      ctx.fill();

      this.canvasGraphicService.clearContext(ctx);
    }

    if (content.drawBoundaryEnabled) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvasWidth, 0);
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.lineTo(0, 0);
      ctx.closePath();

      const canvasBoundary = this.regionSelectorGeometryService.imageToCanvasShape(
        canvas,
        content,
        content.drawBoundary
      ) as Eclipse;
      ctx.ellipse(
        canvasBoundary.center.x * canvasWidth,
        canvasBoundary.center.y * canvasHeight,
        canvasBoundary.radiusX * canvasWidth,
        canvasBoundary.radiusY * canvasHeight,
        0,
        0,
        2 * Math.PI,
        true
      );
      ctx.closePath();

      ctx.fillStyle = DRAW_MARGIN_BOUNDARY_MASK_COLOR;
      ctx.fill();

      this.canvasGraphicService.clearContext(ctx);
    }
  }
}
