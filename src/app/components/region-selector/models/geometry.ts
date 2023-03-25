import {
  Polygon as TurfPolygon,
  polygon as toTurfPolygon,
  point as toTurfPoint,
  area,
  booleanPointInPolygon,
} from '@turf/turf';

export interface Coordinate {
  x: number;
  y: number;
}

export interface Shape {
  getVertices(): Coordinate[];
  getArea(): number;
  isPointInside(point: Coordinate): boolean;
  draw(
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void;
}

export class FreePolygon implements Shape {
  private turfPolygon: TurfPolygon | undefined = undefined;

  constructor(private vertices: Coordinate[]) {}

  public getVertices(): Coordinate[] {
    return [...this.vertices];
  }

  public setVertices(vertices: Coordinate[]): void {
    this.vertices = [...vertices];
    this.turfPolygon = undefined;
  }

  public toTuftPolygon(): TurfPolygon {
    if (this.turfPolygon !== undefined) {
      return this.turfPolygon;
    }

    const coordinateList: number[][] = [];
    for (const vertex of this.vertices) {
      coordinateList.push([vertex.x, vertex.y]);
    }
    coordinateList.push([this.vertices[0].x, this.vertices[0].y]);
    this.turfPolygon = toTurfPolygon([coordinateList]).geometry;

    return this.turfPolygon;
  }

  public getArea(): number {
    return area(this.toTuftPolygon());
  }

  public isPointInside(point: Coordinate): boolean {
    if (this.vertices.length < 3) {
      return false;
    }

    const turfPoint = toTurfPoint([point.x, point.y]).geometry;
    const turfPolygon = this.toTuftPolygon();
    return booleanPointInPolygon(turfPoint, turfPolygon);
  }

  public draw(
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const lastVertex: Coordinate = this.vertices[this.vertices.length - 1];
    ctx.beginPath();
    ctx.moveTo(lastVertex.x * canvasWidth, lastVertex.y * canvasHeight);
    for (const vert of this.vertices) {
      ctx.lineTo(vert.x * canvasWidth, vert.y * canvasHeight);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export interface Rectangle {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}
