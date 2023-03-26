import { Injectable } from '@angular/core';
import { Polygon, Vertex } from '../../dataaccess/api';

const BASE64_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

@Injectable({
  providedIn: 'root',
})
export class RegionImageService {
  public async generateRegionImage(imageSrc: string, border: Polygon): Promise<string> {
    return new Promise<string>((resolve) => {
      const { vertices } = border;
      const xs = vertices.map((item) => item.x);
      const ys = vertices.map((item) => item.y);
      const left = Math.min(...xs);
      const right = Math.max(...xs);
      const top = Math.min(...ys);
      const bottom = Math.max(...ys);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * (right - left);
        canvas.height = img.height * (bottom - top);
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
          resolve(BASE64_PLACEHOLDER);
          return;
        }

        this.clipPolygon(img.width, img.height, ctx, vertices, left, top);
        ctx.drawImage(img, -left * img.width, -top * img.height);
        resolve(canvas.toDataURL());
      };
      img.src = imageSrc;
    });
  }

  private clipPolygon(
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    vertices: Vertex[],
    left: number,
    top: number
  ): void {
    ctx.beginPath();
    const verticesCount = vertices.length;
    ctx.moveTo((vertices[verticesCount - 1].x - left) * width, (vertices[verticesCount - 1].y - top) * height);
    for (const item of vertices) {
      ctx.lineTo((item.x - left) * width, (item.y - top) * height);
    }
    ctx.closePath();
    ctx.clip();
  }
}
