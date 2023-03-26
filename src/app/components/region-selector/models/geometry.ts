import {
  Polygon as TurfPolygon,
  polygon as toTurfPolygon,
  point as toTurfPoint,
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
  draw(canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D): void;
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
    const verticesCount = this.vertices.length;
    let area = 0;
    for (let i = 0; i < verticesCount; i++) {
      const j = i == verticesCount - 1 ? 0 : i + 1;
      area += this.vertices[i].x * this.vertices[j].y - this.vertices[j].x * this.vertices[i].y;
    }
    return Math.abs(area / 2);
  }

  public isPointInside(point: Coordinate): boolean {
    if (this.vertices.length < 3) {
      return false;
    }

    const turfPoint = toTurfPoint([point.x, point.y]).geometry;
    const turfPolygon = this.toTuftPolygon();
    return booleanPointInPolygon(turfPoint, turfPolygon);
  }

  public draw(canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D): void {
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

export class Eclipse implements Shape {
  constructor(public readonly center: Coordinate, public readonly radiusX: number, public readonly radiusY: number) {}

  public getVertices(): Coordinate[] {
    const perimeter = 2 * Math.PI * Math.sqrt((this.radiusX * this.radiusX + this.radiusY * this.radiusY) / 2);
    const coordinateCount = Math.floor(perimeter / VERTICES_MAX_DISTANCE);
    const vertices = [];
    for (let i = 0; i < coordinateCount; i++) {
      const angle = (Math.PI * 2 * i) / coordinateCount;
      const x = this.center.x + Math.cos(angle) * this.radiusX;
      const y = this.center.y + Math.sin(angle) * this.radiusY;
      vertices.push({ x, y });
    }
    return vertices;
  }

  public getArea(): number {
    return this.radiusX * this.radiusY * Math.PI;
  }

  public isPointInside(point: Coordinate): boolean {
    const deltaX = point.x - this.center.x;
    const deltaY = point.y - this.center.y;
    const deltaXSquare = deltaX * deltaX;
    const deltaYSquare = deltaY * deltaY;
    const radiusXSquare = this.radiusX * this.radiusX;
    const radiusYSquare = this.radiusY * this.radiusY;
    return radiusXSquare * radiusYSquare >= deltaXSquare * radiusYSquare + deltaYSquare * radiusXSquare;
  }

  public draw(canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.ellipse(
      this.center.x * canvasWidth,
      this.center.y * canvasHeight,
      this.radiusX * canvasWidth,
      this.radiusY * canvasHeight,
      0,
      0,
      2 * Math.PI,
      false
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export class Circle extends Eclipse {
  constructor(public override readonly center: Coordinate, public readonly radius: number) {
    super(center, radius, radius);
  }
}

export class Rectangle implements Shape {
  constructor(
    public readonly bottomLeft: Coordinate,
    public readonly width: number,
    public readonly height: number,
    public readonly angle: number
  ) {}

  public getVertices(): Coordinate[] {
    return [this.bottomLeft, this.getBottomRight(), this.getTopRight(), this.getTopLeft()];
  }

  public getArea(): number {
    return this.width * this.height;
  }

  public isPointInside(point: Coordinate): boolean {
    const vertices = this.getVertices();
    const coordinateList = [...vertices.map((vertex) => [vertex.x, vertex.y]), [vertices[0].x, vertices[0].y]];
    const turfPolygon = toTurfPolygon([coordinateList]).geometry;
    const turfPoint = [point.x, point.y];
    return booleanPointInPolygon(turfPoint, turfPolygon);
  }

  public draw(canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D): void {
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
    const x = this.bottomLeft.x + this.width * Math.cos(this.angle) - this.height * Math.sin(this.angle);
    const y = this.bottomLeft.y + this.width * Math.sin(this.angle) + this.height * Math.cos(this.angle);
    return { x, y };
  }
}
