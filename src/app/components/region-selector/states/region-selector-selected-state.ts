import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorState } from './region-selector-state';

export class SelectedState implements RegionSelectorState {
  constructor(
    public readonly content: RegionSelectorContent,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {}

  public onLeftMouseDown(): RegionSelectorState {
    return this;
  }

  public onMouseMove(): RegionSelectorState {
    return this;
  }

  public onLeftMouseUp(): RegionSelectorState {
    return this;
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
      this.regionSelectorGraphicService.drawRegionList(canvas, ctx, this.content);
    }

    this.drawDrawnShapeList(canvas, canvasWidth, canvasHeight, ctx);

    canvas.style.cursor = 'auto';

    return ctx;
  }

  private drawDrawnShapeList(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    for (const drawnPolygon of this.content.drawnShapeList) {
      const drawnCanvasShape = this.regionSelectorGeometryService.imageToCanvasShape(
        canvas,
        this.content,
        drawnPolygon
      );
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1890ff';
      ctx.fillStyle = 'transparent';
      drawnCanvasShape.draw(canvasWidth, canvasHeight, ctx);
      this.canvasGraphicService.clearContext(ctx);
    }
  }
}
