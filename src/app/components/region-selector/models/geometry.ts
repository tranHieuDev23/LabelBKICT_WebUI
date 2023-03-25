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

const VERTICES_MAX_DISTANCE = 1e-2;

export class Circle implements Shape {
  constructor(private center: Coordinate, private radius: number) {}

  public getVertices(): Coordinate[] {
    const perimeter = this.radius * 2 * Math.PI;
    const coordinateCount = Math.floor(perimeter / VERTICES_MAX_DISTANCE);
    const vertices = [];
    for (let i = 0; i < coordinateCount; i++) {
      const angle = (Math.PI * 2 * i) / coordinateCount;
      const x = this.center.x + Math.cos(angle);
      const y = this.center.y + Math.sin(angle);
      vertices.push({ x, y });
    }
    return vertices;
  }

  public getArea(): number {
    return this.radius * this.radius * Math.PI;
  }

  public isPointInside(point: Coordinate): boolean {
    const deltaX = point.x - this.center.x;
    const deltaY = point.y - this.center.y;
    return this.radius * this.radius >= deltaX * deltaX + deltaY * deltaY;
  }

  public draw(
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    ctx.beginPath();
    ctx.arc(
      this.center.x * canvasWidth,
      this.center.y * canvasHeight,
      this.radius,
      0,
      2 * Math.PI,
      false
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export class Rectangle implements Shape {
  constructor(
    private bottomLeft: Coordinate,
    private width: number,
    private height: number,
    private angle: number
  ) {}

  public getVertices(): Coordinate[] {
    return [
      this.bottomLeft,
      this.getBottomRight(),
      this.getTopRight(),
      this.getTopLeft(),
    ];
  }

  public getArea(): number {
    return this.width * this.height;
  }

  public isPointInside(point: Coordinate): boolean {
    const vertices = this.getVertices();
    const coordinateList = [
      ...vertices.map((vertex) => [vertex.x, vertex.y]),
      [vertices[0].x, vertices[0].y],
    ];
    const turfPolygon = toTurfPolygon([coordinateList]).geometry;
    const turfPoint = [point.x, point.y];
    return booleanPointInPolygon(turfPoint, turfPolygon);
  }

  public draw(
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const vertices = this.getVertices();
    let lastVertex = vertices[vertices.length - 1];
    ctx.beginPath();
    ctx.moveTo(lastVertex.x * canvasWidth, lastVertex.y * canvasHeight);
    for (const vert of vertices) {
      ctx.lineTo(vert.x * canvasWidth, vert.y * canvasHeight);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private getBottomRight(): Coordinate {
    const x = this.bottomLeft.x + this.width * Math.cos(this.angle);
    const y = this.bottomLeft.y + this.width * Math.sin(this.angle);
    return { x, y };
  }

  private getTopLeft(): Coordinate {
    const x = this.bottomLeft.x - this.height * Math.sin(this.angle);
    const y = this.bottomLeft.y + this.height * Math.cos(this.angle);
    return { x, y };
  }

  private getTopRight(): Coordinate {
    const x =
      this.bottomLeft.x +
      this.width * Math.cos(this.angle) -
      this.height * Math.sin(this.angle);
    const y =
      this.bottomLeft.y +
      this.width * Math.sin(this.angle) +
      this.height * Math.cos(this.angle);
    return { x, y };
  }
}
