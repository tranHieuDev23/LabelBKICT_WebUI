export interface Coordinate {
  x: number;
  y: number;
}

export interface Polygon {
  vertices: Coordinate[];
}

export interface Rectangle {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}
