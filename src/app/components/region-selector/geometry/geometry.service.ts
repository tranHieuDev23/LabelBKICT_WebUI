import { Injectable } from '@angular/core';
import {
  Point as TurfPoint,
  Polygon as TurfPolygon,
  MultiPolygon as TurfMultiPolygon,
  point as toTurfPoint,
  polygon as toTurfPolygon,
  multiPolygon as toTurfMultiPolygon,
  cleanCoords,
  union,
  intersect,
  kinks,
  unkinkPolygon,
  area,
  booleanPointInPolygon,
  Position,
} from '@turf/turf';
import { Rectangle } from '../models';

export interface Coordinate {
  x: number;
  y: number;
}

export interface Polygon {
  vertices: Coordinate[];
}

@Injectable({
  providedIn: 'root',
})
export class GeometryService {
  public getPolygonBoundingBox(polygon: Polygon): Rectangle {
    const { vertices } = polygon;
    const minX: number = Math.min(...vertices.map((item) => item.x));
    const maxX: number = Math.max(...vertices.map((item) => item.x));
    const minY: number = Math.min(...vertices.map((item) => item.y));
    const maxY: number = Math.max(...vertices.map((item) => item.y));
    return {
      dx: minX,
      dy: minY,
      dw: maxX - minX,
      dh: maxY - minY,
    };
  }

  public getDistance(from: Coordinate, to: Coordinate): number {
    return Math.sqrt(
      (from.x - to.x) * (from.x - to.x) + (from.y - to.y) * (from.y - to.y)
    );
  }

  public getInBetweenPointList(
    from: Coordinate,
    to: Coordinate,
    maxPointDistance: number
  ): Coordinate[] {
    const fromToDistance = this.getDistance(from, to);
    if (fromToDistance <= maxPointDistance) {
      return [];
    }
    const numPointToInsert = Math.floor(fromToDistance / maxPointDistance);
    const deltaX = (to.x - from.x) / (numPointToInsert + 1);
    const deltaY = (to.y - from.y) / (numPointToInsert + 1);
    const results: Coordinate[] = [];
    for (let i = 1; i <= numPointToInsert; i++) {
      results.push({
        x: from.x + i * deltaX,
        y: from.y + i * deltaY,
      });
    }
    return results;
  }

  public getOpenNeighborVertexID(
    polygon: Polygon,
    vertexID: number,
    openThreshold: number
  ): { vertexID: number; isOpenVertexPrevious: boolean } | null {
    const vertex = polygon.vertices[vertexID];
    const prevIndex =
      vertexID === 0 ? polygon.vertices.length - 1 : vertexID - 1;
    const prevVertex = polygon.vertices[prevIndex];
    if (this.getDistance(vertex, prevVertex) > openThreshold) {
      return { vertexID: prevIndex, isOpenVertexPrevious: true };
    }
    const nextIndex =
      vertexID === polygon.vertices.length - 1 ? 0 : vertexID + 1;
    const nextVertex = polygon.vertices[nextIndex];
    if (this.getDistance(vertex, nextVertex) > openThreshold) {
      return { vertexID: nextIndex, isOpenVertexPrevious: false };
    }
    return null;
  }

  public densifyPolygon(
    polygon: Polygon,
    maxVerticesDistance: number
  ): Polygon {
    const resultVertices: Coordinate[] = [];
    let lastVertex = polygon.vertices[polygon.vertices.length - 1];
    for (const vertex of polygon.vertices) {
      resultVertices.push(
        ...this.getInBetweenPointList(lastVertex, vertex, maxVerticesDistance),
        vertex
      );
      lastVertex = vertex;
    }
    return {
      vertices: resultVertices,
    };
  }

  public normalizePolygon(polygon: Polygon): Polygon {
    const turfPolygon = this.convertPolygonToTurfPolygon(polygon);
    const reducedPolygon = cleanCoords(turfPolygon);
    const fixedPolygon = this.fixSelfIntersectedTurfPolygon(reducedPolygon);
    return this.convertTurfPolygonToPolygon(fixedPolygon);
  }

  public isPointInPolygon(point: Coordinate, polygon: Polygon): boolean {
    if (polygon.vertices.length < 3) {
      return false;
    }
    const turfPoint = this.convertCoordinateToTurfPoint(point);
    const turfPolygon = this.convertPolygonToTurfPolygon(polygon);
    return booleanPointInPolygon(turfPoint, turfPolygon);
  }

  public normalizeRegionWithHoles(
    border: Polygon,
    holes: Polygon[]
  ): {
    border: Polygon;
    holes: Polygon[];
  } {
    let turfBorder = this.convertPolygonToTurfPolygon(border);
    let turfHoles = holes.map((hole) => this.convertPolygonToTurfPolygon(hole));

    // Remove redundant vertices
    turfBorder = cleanCoords(turfBorder);
    turfHoles = turfHoles.map((hole) => cleanCoords(hole));

    // Fix self-intersection
    turfBorder = this.fixSelfIntersectedTurfPolygon(turfBorder);
    turfHoles = turfHoles.map((hole) =>
      this.fixSelfIntersectedTurfPolygon(hole)
    );

    // Join all common area between holes
    if (turfHoles.length > 1) {
      let joinedTurfHoles = [turfHoles[0]];
      for (let i = 1; i < turfHoles.length; i++) {
        joinedTurfHoles = this.calculateUnionOfTurfPolygonListAndTurfPolygon(
          joinedTurfHoles,
          turfHoles[i]
        );
      }
      turfHoles = joinedTurfHoles;
    }

    // Take only the intersect between the holes and the border
    if (turfHoles.length > 0) {
      turfHoles = this.calculateIntersectionOfTurfPolygonListAndTurfPolygon(
        turfHoles,
        turfBorder
      );
    }

    const normalizedBorder = this.convertTurfPolygonToPolygon(turfBorder);
    // Remove all holes with 0 vertex
    const normalizedHoles = turfHoles
      .map((hole) => this.convertTurfPolygonToPolygon(hole))
      .filter((hole) => hole.vertices.length > 0);

    return {
      border: normalizedBorder,
      holes: normalizedHoles,
    };
  }

  private fixSelfIntersectedTurfPolygon(polygon: TurfPolygon): TurfPolygon {
    const kinkPointList = kinks(polygon).features.map((point) => {
      return point.geometry.coordinates;
    });

    /**
     * HACK: unkinkPolygon() will cause error if there is an intersection that lies directly on a vertex.
     * To prevent that, we will just remove these vertices.
     */
    const verticesFarFromKinkList = polygon.coordinates[0].filter((vertex) => {
      return kinkPointList.every((kinkPoint) => {
        return vertex[0] !== kinkPoint[0] || vertex[1] !== kinkPoint[1];
      });
    });

    const unKinkedPolygonList = unkinkPolygon(
      toTurfPolygon([this.ensureStartEndVertexEqual(verticesFarFromKinkList)])
    );

    // Only keep the polygon with the maximum area
    let maxArea = -1;
    let maxAreaIndex = -1;
    unKinkedPolygonList.features.forEach((polygon, index) => {
      const itemArea = area(polygon);
      if (itemArea > maxArea) {
        maxArea = itemArea;
        maxAreaIndex = index;
      }
    });

    return unKinkedPolygonList.features[maxAreaIndex].geometry;
  }

  private calculateUnionOfTurfPolygonListAndTurfPolygon(
    polygonList: TurfPolygon[],
    polygon: TurfPolygon
  ): TurfPolygon[] {
    const turfMultiPolygon =
      this.convertTuftPolygonListToTurfMultiPolygon(polygonList);
    const unionTurfPolygon = union(turfMultiPolygon, polygon);
    if (unionTurfPolygon === null) {
      return [];
    }
    if (unionTurfPolygon.geometry.type === 'Polygon') {
      return [unionTurfPolygon.geometry];
    } else {
      return this.convertTurfMultiPolygonToTurfPolygonList(
        unionTurfPolygon.geometry
      );
    }
  }

  private calculateIntersectionOfTurfPolygonListAndTurfPolygon(
    polygonList: TurfPolygon[],
    polygon: TurfPolygon
  ): TurfPolygon[] {
    const turfMultiPolygon =
      this.convertTuftPolygonListToTurfMultiPolygon(polygonList);
    const unionTurfPolygon = intersect(turfMultiPolygon, polygon);
    if (unionTurfPolygon === null) {
      return [];
    }
    if (unionTurfPolygon.geometry.type === 'Polygon') {
      return [unionTurfPolygon.geometry];
    } else {
      return this.convertTurfMultiPolygonToTurfPolygonList(
        unionTurfPolygon.geometry
      );
    }
  }

  private convertCoordinateToTurfPoint(coordinate: Coordinate): TurfPoint {
    return toTurfPoint([coordinate.x, coordinate.y]).geometry;
  }

  private convertPolygonToTurfPolygon(polygon: Polygon): TurfPolygon {
    const vertices = polygon.vertices || [];
    const coordinateList: number[][] = [];
    for (const vertex of vertices) {
      coordinateList.push([vertex.x, vertex.y]);
    }
    coordinateList.push([vertices[0].x, vertices[0].y]);
    return toTurfPolygon([coordinateList]).geometry;
  }

  private convertTurfPolygonToPolygon(polygon: TurfPolygon): Polygon {
    return {
      vertices: polygon.coordinates[0].map((position) => {
        return { x: position[0], y: position[1] };
      }),
    };
  }

  private convertTuftPolygonListToTurfMultiPolygon(
    polygonList: TurfPolygon[]
  ): TurfMultiPolygon {
    const coordinateList = [];
    for (const item of polygonList) {
      coordinateList.push(item.coordinates);
    }
    return toTurfMultiPolygon(coordinateList).geometry;
  }

  private convertTurfMultiPolygonToTurfPolygonList(
    multiPolygon: TurfMultiPolygon
  ): TurfPolygon[] {
    const polygonList: TurfPolygon[] = [];
    for (const coordinateList of multiPolygon.coordinates) {
      polygonList.push(toTurfPolygon(coordinateList).geometry);
    }
    return polygonList;
  }

  private ensureStartEndVertexEqual(positionList: Position[]): Position[] {
    const lastIndex = positionList.length - 1;
    if (
      positionList[0][0] === positionList[lastIndex][0] &&
      positionList[0][1] === positionList[lastIndex][1]
    ) {
      return positionList;
    }
    return [...positionList, positionList[0]];
  }
}
