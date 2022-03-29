import { Injectable } from '@angular/core';
import { Coordinate, Polygon } from '../models';

export interface DrawCircleArguments {
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;
  center: Coordinate;
  radius: number;
  lineColor: string;
  fillColor?: string;
}

export interface DrawLineArguments {
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;
  lineStart: Coordinate;
  lineEnd: Coordinate;
  lineColor: string;
}

export interface DrawPolygonArguments {
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;
  polygon: Polygon;
  lineColor: string;
  fillColor?: string;
}

export interface DrawCheckerboardArguments {
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;
  cellSize: number;
  whiteColor: string;
  blackColor: string;
}

export interface DrawTextBoxArguments {
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;
  textBoxCenter: Coordinate;
  text: string;
  fontSize: number;
  font: string;
  textColor: string;
  boxColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class CanvasGraphicService {
  constructor() {}

  private readonly textBoxPadding = 2;

  public drawCircle(args: DrawCircleArguments): void {
    args.ctx.beginPath();
    args.ctx.arc(
      args.center.x * args.canvasWidth,
      args.center.y * args.canvasHeight,
      args.radius,
      0,
      2 * Math.PI,
      false
    );
    args.ctx.closePath();
    if (args.fillColor) {
      args.ctx.fillStyle = args.fillColor;
      args.ctx.fill();
    }
    args.ctx.lineWidth = 1;
    args.ctx.strokeStyle = args.lineColor;
    args.ctx.stroke();
  }

  public drawLine(args: DrawLineArguments): void {
    args.ctx.beginPath();
    args.ctx.moveTo(
      args.lineStart.x * args.canvasWidth,
      args.lineStart.y * args.canvasHeight
    );
    args.ctx.lineTo(
      args.lineEnd.x * args.canvasWidth,
      args.lineEnd.y * args.canvasHeight
    );
    args.ctx.closePath();
    args.ctx.lineWidth = 2;
    args.ctx.strokeStyle = args.lineColor;
    args.ctx.stroke();
  }

  public drawPolygon(args: DrawPolygonArguments): void {
    const { vertices } = args.polygon;
    const lastVertex: Coordinate = vertices[vertices.length - 1];
    args.ctx.beginPath();
    args.ctx.lineWidth = 2;
    args.ctx.strokeStyle = args.lineColor;
    args.ctx.moveTo(
      lastVertex.x * args.canvasWidth,
      lastVertex.y * args.canvasHeight
    );
    for (const vert of vertices) {
      args.ctx.lineTo(vert.x * args.canvasWidth, vert.y * args.canvasHeight);
    }
    args.ctx.closePath();
    if (args.fillColor) {
      args.ctx.fillStyle = args.fillColor;
      args.ctx.fill();
    }
    args.ctx.stroke();
  }

  public drawCheckerboard(args: DrawCheckerboardArguments): void {
    const numCol = Math.ceil(args.canvasWidth / args.cellSize);
    const numRow = Math.ceil(args.canvasHeight / args.cellSize);
    for (let i = 0; i < numRow; i++) {
      for (let j = 0; j < numCol; j++) {
        const x = j * args.cellSize;
        const y = i * args.cellSize;
        if ((i + j) % 2 === 0) {
          args.ctx.fillStyle = args.whiteColor;
        } else {
          args.ctx.fillStyle = args.blackColor;
        }
        args.ctx.fillRect(x, y, args.cellSize, args.cellSize);
      }
    }
  }

  public drawTextBox(args: DrawTextBoxArguments): void {
    const centerX = args.canvasWidth * args.textBoxCenter.x;
    const centerY = args.canvasHeight * args.textBoxCenter.y;
    args.ctx.font = `${args.fontSize}px ${args.font}`;
    const measureResult = args.ctx.measureText(args.text);
    const textWidth =
      Math.abs(measureResult.actualBoundingBoxLeft) +
      Math.abs(measureResult.actualBoundingBoxRight);
    const textHeight = args.fontSize;
    const boxWidth = textWidth + this.textBoxPadding * 2;
    const boxHeight = textHeight + this.textBoxPadding * 2;
    const topLeftX = centerX - boxWidth / 2;
    const topLeftY = centerY - boxHeight / 2;

    args.ctx.fillStyle = args.boxColor;
    args.ctx.fillRect(topLeftX, topLeftY - boxHeight, boxWidth, boxHeight);
    args.ctx.fillStyle = args.textColor;
    args.ctx.textBaseline = 'bottom';
    args.ctx.fillText(
      args.text,
      topLeftX + this.textBoxPadding,
      topLeftY - this.textBoxPadding
    );
  }

  public resizeCanvasMatchParent(canvas: HTMLCanvasElement): void {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    const newCanvasWidth = canvas.offsetWidth;
    const newCanvasHeight = canvas.offsetHeight;
    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
  }
}
