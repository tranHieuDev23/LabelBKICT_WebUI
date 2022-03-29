import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorState } from './region-selector-state';

export class SelectedState implements RegionSelectorState {
  constructor(
    private content: RegionSelectorContent,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {}

  public getContent(): RegionSelectorContent {
    return this.content;
  }

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
    this.canvasGraphicService.resizeCanvasMatchParent(canvas);
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
      this.regionSelectorGraphicService.drawRegionList(
        canvas,
        ctx,
        this.content
      );
    }

    this.drawSelectedPolygonList(canvas, canvasWidth, canvasHeight, ctx);

    return ctx;
  }

  private drawSelectedPolygonList(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    for (const drawnPolygon of this.content.drawnPolygonList) {
      const drawnCanvasPolygon =
        this.regionSelectorGeometryService.imageToCanvasPolygon(
          canvas,
          this.content,
          drawnPolygon
        );
      this.canvasGraphicService.drawPolygon({
        canvasWidth,
        canvasHeight,
        ctx,
        polygon: drawnCanvasPolygon,
        lineColor: '#1890ff',
      });
    }
  }
}
