import { Injectable } from '@angular/core';
import { Coordinate, Rectangle } from '../models';
import { RegionSelectorContent } from '../region-selector-content';

@Injectable({
  providedIn: 'root',
})
export class RegionSelectorGeometryService {
  public calculateImageDrawRegion(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent
  ): Rectangle {
    if (content.image === null) {
      return { dx: 0, dy: 0, dw: 0, dh: 0 };
    }
    const imageActualZoom = this.getImageActualZoom(canvas, content);
    const imageActualWidth = +content.image.width * imageActualZoom;
    const imageActualHeight = +content.image.height * imageActualZoom;
    return {
      dx: -content.imageOrigin.x * imageActualWidth,
      dy: -content.imageOrigin.y * imageActualHeight,
      dw: imageActualWidth,
      dh: imageActualHeight,
    };
  }

  public mouseToCanvasPosition(
    canvas: HTMLCanvasElement,
    mousePos: Coordinate
  ): Coordinate {
    const rect = canvas.getBoundingClientRect();
    const x = (mousePos.x - rect.left) / canvas.offsetWidth;
    const y = (mousePos.y - rect.top) / canvas.offsetHeight;
    return { x, y };
  }

  public canvasToImagePosition(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    canvasPos: Coordinate
  ): Coordinate {
    const imageX =
      content.imageOrigin.x +
      (this.getImageXOfCanvasRight(canvas, content) - content.imageOrigin.x) *
        canvasPos.x;
    const imageY =
      content.imageOrigin.y +
      (this.getImageYOfCanvasBottom(canvas, content) - content.imageOrigin.y) *
        canvasPos.y;
    return { x: imageX, y: imageY };
  }

  public mouseToImagePosition(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    mousePos: Coordinate
  ): Coordinate {
    return this.canvasToImagePosition(
      canvas,
      content,
      this.mouseToCanvasPosition(canvas, mousePos)
    );
  }

  public imageToCanvasPosition(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    imagePos: Coordinate
  ): Coordinate {
    const canvasX =
      (imagePos.x - content.imageOrigin.x) /
      (this.getImageXOfCanvasRight(canvas, content) - content.imageOrigin.x);
    const canvasY =
      (imagePos.y - content.imageOrigin.y) /
      (this.getImageYOfCanvasBottom(canvas, content) - content.imageOrigin.y);
    return { x: canvasX, y: canvasY };
  }

  public canvasToMousePosition(
    canvas: HTMLCanvasElement,
    canvasPos: Coordinate
  ): Coordinate {
    const rect = canvas.getBoundingClientRect();
    const x = canvasPos.x * canvas.offsetWidth + rect.left;
    const y = canvasPos.y * canvas.offsetHeight + rect.top;
    return { x, y };
  }

  public imageToMousePosition(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    imagePos: Coordinate
  ): Coordinate {
    return this.canvasToMousePosition(
      canvas,
      this.imageToCanvasPosition(canvas, content, imagePos)
    );
  }

  public getMousePositionFromMouseEvent(
    event: MouseEvent | TouchEvent
  ): Coordinate {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    }
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  private getImageActualZoom(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent
  ): number {
    if (content.image === null) {
      return 1;
    }
    return (
      content.zoom *
      Math.min(
        canvas.height / +content.image.height,
        canvas.width / +content.image.width
      )
    );
  }

  private getImageXOfCanvasRight(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent
  ): number {
    if (content.image === null) {
      return 0;
    }
    const imageActualZoom = this.getImageActualZoom(canvas, content);
    const imageActualWidth = +content.image.width * imageActualZoom;
    const imageXOfCanvasRight =
      content.imageOrigin.x + canvas.width / imageActualWidth;
    return imageXOfCanvasRight;
  }

  private getImageYOfCanvasBottom(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent
  ): number {
    if (content.image === null) {
      return 0;
    }
    const imageActualZoom = this.getImageActualZoom(canvas, content);
    const imageActualHeight = +content.image.height * imageActualZoom;
    const imageYOfCanvasBottom =
      content.imageOrigin.y + canvas.height / imageActualHeight;
    return imageYOfCanvasBottom;
  }
}
