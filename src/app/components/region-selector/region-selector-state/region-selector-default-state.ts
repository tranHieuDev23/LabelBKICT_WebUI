import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { RegionSelectorState } from './region-selector-state';

export class DefaultState implements RegionSelectorState {
  constructor(
    private readonly content: RegionSelectorContent,
    private readonly snapshotService: RegionSelectorSnapshotService,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {}

  public getContent(): RegionSelectorContent {
    return this.content;
  }

  public onLeftMouseDown(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState {
    return new DefaultState(
      this.content,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  public onMouseMove(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent,
    isLeftMouseDown: boolean
  ): RegionSelectorState {
    return this;
  }

  public onLeftMouseUp(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState {
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
    if (this.content.isDrawnRegionListVisible) {
      this.regionSelectorGraphicService.drawRegionList(
        canvas,
        ctx,
        this.content
      );
    }

    return ctx;
  }
}
