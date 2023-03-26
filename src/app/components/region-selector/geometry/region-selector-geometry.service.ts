import { Injectable } from '@angular/core';
import { Circle, Coordinate, Eclipse, FreePolygon, Shape } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { GeometryService } from './geometry.service';

@Injectable({
  providedIn: 'root',
})
export class RegionSelectorGeometryService {
  constructor(private readonly geometryService: GeometryService) {}

  public calculateImageDrawRegion(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent
  ): {
    dx: number;
    dy: number;
    dw: number;
    dh: number;
  } {
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

  public mouseToCanvasPosition(canvas: HTMLCanvasElement, mousePos: Coordinate): Coordinate {
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
      content.imageOrigin.x + (this.getImageXOfCanvasRight(canvas, content) - content.imageOrigin.x) * canvasPos.x;
    const imageY =
      content.imageOrigin.y + (this.getImageYOfCanvasBottom(canvas, content) - content.imageOrigin.y) * canvasPos.y;
    return { x: imageX, y: imageY };
  }

  public mouseToImagePosition(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    mousePos: Coordinate
  ): Coordinate {
    return this.canvasToImagePosition(canvas, content, this.mouseToCanvasPosition(canvas, mousePos));
  }

  public imageToCanvasPosition(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    imagePos: Coordinate
  ): Coordinate {
    const canvasX =
      (imagePos.x - content.imageOrigin.x) / (this.getImageXOfCanvasRight(canvas, content) - content.imageOrigin.x);
    const canvasY =
      (imagePos.y - content.imageOrigin.y) / (this.getImageYOfCanvasBottom(canvas, content) - content.imageOrigin.y);
    return { x: canvasX, y: canvasY };
  }

  public canvasToMousePosition(canvas: HTMLCanvasElement, canvasPos: Coordinate): Coordinate {
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
    return this.canvasToMousePosition(canvas, this.imageToCanvasPosition(canvas, content, imagePos));
  }

  public imageToCanvasShape(canvas: HTMLCanvasElement, content: RegionSelectorContent, shape: Shape): Shape {
    if (shape instanceof FreePolygon) {
      const canvasVertices = shape.getVertices().map((vertex) => this.imageToCanvasPosition(canvas, content, vertex));
      return new FreePolygon(canvasVertices);
    }

    if (shape instanceof Eclipse) {
      const pointXOnDiameter = { x: shape.center.x + shape.radiusX, y: shape.center.y };
      const pointYOnDiameter = { x: shape.center.x, y: shape.center.y + shape.radiusX };
      const canvasCenter = this.imageToCanvasPosition(canvas, content, shape.center);
      const canvasPointXOnDiameter = this.imageToCanvasPosition(canvas, content, pointXOnDiameter);
      const canvasPointYOnDiameter = this.imageToCanvasPosition(canvas, content, pointYOnDiameter);
      const canvasRadiusX = this.geometryService.getDistance(canvasCenter, canvasPointXOnDiameter);
      const canvasRadiusY = this.geometryService.getDistance(canvasCenter, canvasPointYOnDiameter);
      return new Eclipse(canvasCenter, canvasRadiusX, canvasRadiusY);
    }

    throw new Error('Unsupported shape');
  }

  public imageToCanvasDistance(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    from: Coordinate,
    to: Coordinate
  ): number {
    const canvasFrom = this.imageToCanvasPosition(canvas, content, from);
    const canvasTo = this.imageToCanvasPosition(canvas, content, to);
    return this.geometryService.getDistance(canvasFrom, canvasTo);
  }

  public canvasToMouseDistance(canvas: HTMLCanvasElement, from: Coordinate, to: Coordinate): number {
    const mouseFrom = this.canvasToMousePosition(canvas, from);
    const mouseTo = this.canvasToMousePosition(canvas, to);
    return this.geometryService.getDistance(mouseFrom, mouseTo);
  }

  public imageToMouseDistance(
    canvas: HTMLCanvasElement,
    content: RegionSelectorContent,
    from: Coordinate,
    to: Coordinate
  ): number {
    const canvasFrom = this.imageToCanvasPosition(canvas, content, from);
    const canvasTo = this.imageToCanvasPosition(canvas, content, to);
    return this.canvasToMouseDistance(canvas, canvasFrom, canvasTo);
  }

  public getMousePositionFromMouseEvent(event: MouseEvent | TouchEvent): Coordinate {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    }
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  private getImageActualZoom(canvas: HTMLCanvasElement, content: RegionSelectorContent): number {
    if (content.image === null) {
      return 1;
    }
    return content.zoom * Math.min(canvas.height / +content.image.height, canvas.width / +content.image.width);
  }

  private getImageXOfCanvasRight(canvas: HTMLCanvasElement, content: RegionSelectorContent): number {
    if (content.image === null) {
      return 0;
    }
    const imageActualZoom = this.getImageActualZoom(canvas, content);
    const imageActualWidth = +content.image.width * imageActualZoom;
    const imageXOfCanvasRight = content.imageOrigin.x + canvas.width / imageActualWidth;
    return imageXOfCanvasRight;
  }

  private getImageYOfCanvasBottom(canvas: HTMLCanvasElement, content: RegionSelectorContent): number {
    if (content.image === null) {
      return 0;
    }
    const imageActualZoom = this.getImageActualZoom(canvas, content);
    const imageActualHeight = +content.image.height * imageActualZoom;
    const imageYOfCanvasBottom = content.imageOrigin.y + canvas.height / imageActualHeight;
    return imageYOfCanvasBottom;
  }
}
