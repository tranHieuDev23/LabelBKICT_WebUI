export class Vertex {
  constructor(public x: number, public y: number) {}

  public static fromJSON(vertexJSON: any): Vertex {
    return new Vertex(vertexJSON.x || 0, vertexJSON.y || 0);
  }
}

export class Polygon {
  constructor(public vertices: Vertex[]) {}

  public static fromJSON(polygonJSON: any): Polygon {
    const vertices = polygonJSON?.vertices || [];
    return new Polygon(vertices.map(Vertex.fromJSON));
  }
}
