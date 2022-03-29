import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { DrawState } from './region-selector-draw-state';
import { RegionSelectorState } from './region-selector-state';

export class DefaultState implements RegionSelectorState {
  constructor(
    private readonly content: RegionSelectorContent,
    private readonly snapshotService: RegionSelectorSnapshotService,
    private readonly geometryService: GeometryService,
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
    const cursorMousePosition =
      this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition =
      this.regionSelectorGeometryService.mouseToImagePosition(
        canvas,
        this.content,
        cursorMousePosition
      );

    const newContent = {
      ...this.content,
    };
    newContent.cursorImagePosition = cursorImagePosition;

    return new DrawState(
      newContent,
      true,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
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

    return ctx;
  }
}
