import { RegionSelectorContent } from '../region-selector-content';

export interface RegionSelectorState {
  content: RegionSelectorContent;
  onLeftMouseDown(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState;
  onMouseMove(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent,
    isLeftMouseDown: boolean
  ): RegionSelectorState;
  onLeftMouseUp(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState;
  onDraw(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null;
}
