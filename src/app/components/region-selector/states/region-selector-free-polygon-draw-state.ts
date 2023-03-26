import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { Coordinate, FreePolygon } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import {
  MINIMUM_NEW_VERTICES_PER_DRAW,
  VERTICES_MAX_DISTANCE,
  VERTICES_MIN_DISTANCE,
  VERTICES_AUTO_CONNECT_DISTANCE,
} from './constants';
import { RegionSelectorState } from './region-selector-state';

export class FreePolygonDrawState implements RegionSelectorState {
  constructor(
    public readonly content: RegionSelectorContent,
    public readonly regionIDToEdit: number | null,
    public readonly shapeIDToAddNewVertex: number | null,
    private readonly snapshotService: RegionSelectorSnapshotService,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly geometryService: GeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {}

  public onLeftMouseDown(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState {
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );
    return this.shapeIDToAddNewVertex === null
      ? this.withFirstVertex(cursorImagePosition)
      : this.withNewVertex(cursorImagePosition);
  }

  public onMouseMove(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent,
    isLeftMouseDown: boolean
  ): RegionSelectorState {
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );

    if (!isLeftMouseDown) {
      const newContent = { ...this.content };
      newContent.cursorImagePosition = cursorImagePosition;
      return new FreePolygonDrawState(
        newContent,
        this.regionIDToEdit,
        this.shapeIDToAddNewVertex,
        this.snapshotService,
        this.regionSelectorGeometryService,
        this.geometryService,
        this.regionSelectorGraphicService,
        this.canvasGraphicService
      );
    }

    if (this.shapeIDToAddNewVertex === null) {
      return this;
    }

    return this.withNewVertex(cursorImagePosition);
  }

  public onLeftMouseUp(): RegionSelectorState {
    if (this.shapeIDToAddNewVertex === null) {
      return this;
    }

    const lastSnapshot = this.snapshotService.getCurrentSnapshot();
    if (lastSnapshot !== null) {
      let lastSnapshotVerticesCount: number;
      if (lastSnapshot.drawnShapeList.length > this.shapeIDToAddNewVertex) {
        const lastSnapshotPolygon = lastSnapshot.drawnShapeList[this.shapeIDToAddNewVertex];
        lastSnapshotVerticesCount = lastSnapshotPolygon.getVertices().length;
      } else {
        lastSnapshotVerticesCount = 0;
      }

      const currentVerticesCount = this.content.drawnShapeList[this.shapeIDToAddNewVertex].getVertices().length;
      if (currentVerticesCount < lastSnapshotVerticesCount + MINIMUM_NEW_VERTICES_PER_DRAW) {
        const newContent = { ...this.content };
        if (lastSnapshotVerticesCount === 0) {
          newContent.drawnShapeList.splice(this.shapeIDToAddNewVertex);
        } else {
          const lastSnapshotPolygon = lastSnapshot.drawnShapeList[this.shapeIDToAddNewVertex];
          newContent.drawnShapeList[this.shapeIDToAddNewVertex] = lastSnapshotPolygon;
        }

        return new FreePolygonDrawState(
          newContent,
          this.regionIDToEdit,
          null,
          this.snapshotService,
          this.regionSelectorGeometryService,
          this.geometryService,
          this.regionSelectorGraphicService,
          this.canvasGraphicService
        );
      }
    }

    this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(this.content.drawnShapeList));
    return new FreePolygonDrawState(
      this.content,
      this.regionIDToEdit,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private withFirstVertex(cursorImagePosition: Coordinate): RegionSelectorState {
    const newContent = { ...this.content };
    newContent.cursorImagePosition = cursorImagePosition;
    newContent.drawnShapeList = [...newContent.drawnShapeList];

    const nearestVertexWithOpenNeighborInfo = this.getNearestVertexWithOpenNeighbor(cursorImagePosition);
    if (nearestVertexWithOpenNeighborInfo === null) {
      // If there is no near vertex with open neighbor to connect to, create a new polygon with only the new vertex
      const polygonIDToAddNewVertex = newContent.drawnShapeList.length;
      newContent.drawnShapeList.push(new FreePolygon([cursorImagePosition]));
      return new FreePolygonDrawState(
        newContent,
        this.regionIDToEdit,
        polygonIDToAddNewVertex,
        this.snapshotService,
        this.regionSelectorGeometryService,
        this.geometryService,
        this.regionSelectorGraphicService,
        this.canvasGraphicService
      );
    }

    const { polygonID, vertexID, openVertexID, isOpenVertexPrevious } = nearestVertexWithOpenNeighborInfo;
    const polygonToAdd = this.content.drawnShapeList[polygonID];
    const polygonToAddVertices = polygonToAdd.getVertices();
    const vertexToConnect = polygonToAddVertices[vertexID];
    const inBetweenPointList = this.geometryService.getInBetweenPointList(
      vertexToConnect,
      cursorImagePosition,
      VERTICES_MAX_DISTANCE
    );
    if (isOpenVertexPrevious) {
      const vertices = [
        ...polygonToAddVertices.slice(0, vertexID).reverse(),
        ...polygonToAddVertices.slice(vertexID).reverse(),
        ...inBetweenPointList,
        cursorImagePosition,
      ];
      newContent.drawnShapeList[polygonID] = new FreePolygon(vertices);
    } else {
      const vertices = [
        ...polygonToAddVertices.slice(openVertexID),
        ...polygonToAddVertices.slice(0, openVertexID),
        ...inBetweenPointList,
        cursorImagePosition,
      ];
      newContent.drawnShapeList[polygonID] = new FreePolygon(vertices);
    }

    return new FreePolygonDrawState(
      newContent,
      this.regionIDToEdit,
      polygonID,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private withNewVertex(cursorImagePosition: Coordinate): RegionSelectorState {
    if (this.shapeIDToAddNewVertex === null) {
      return this;
    }

    const newContent = { ...this.content };
    newContent.cursorImagePosition = cursorImagePosition;

    const polygonToAdd = this.content.drawnShapeList[this.shapeIDToAddNewVertex];
    const polygonToAddVertices = polygonToAdd.getVertices();
    const vertexToConnect = polygonToAddVertices[polygonToAddVertices.length - 1];
    if (this.geometryService.getDistance(vertexToConnect, cursorImagePosition) < VERTICES_MIN_DISTANCE) {
      return this;
    }

    const inBetweenPointList = this.geometryService.getInBetweenPointList(
      vertexToConnect,
      cursorImagePosition,
      VERTICES_MAX_DISTANCE
    );
    newContent.drawnShapeList = [...newContent.drawnShapeList];
    newContent.drawnShapeList[this.shapeIDToAddNewVertex] = new FreePolygon([
      ...polygonToAddVertices,
      ...inBetweenPointList,
      cursorImagePosition,
    ]);

    const currentVerticesCount = newContent.drawnShapeList[this.shapeIDToAddNewVertex].getVertices().length;
    if (currentVerticesCount > MINIMUM_NEW_VERTICES_PER_DRAW) {
      const openNeighborVertex = newContent.drawnShapeList[this.shapeIDToAddNewVertex].getVertices()[0];
      if (this.geometryService.getDistance(openNeighborVertex, cursorImagePosition) <= VERTICES_MAX_DISTANCE) {
        // if cursor position is close enough to the next vertex, automatically connect to that vertex and stop drawing
        this.snapshotService.storeSnapshot(new RegionSelectorSnapshot(newContent.drawnShapeList));
        return new FreePolygonDrawState(
          newContent,
          this.regionIDToEdit,
          null,
          this.snapshotService,
          this.regionSelectorGeometryService,
          this.geometryService,
          this.regionSelectorGraphicService,
          this.canvasGraphicService
        );
      }
    }

    return new FreePolygonDrawState(
      newContent,
      this.regionIDToEdit,
      this.shapeIDToAddNewVertex,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  public onDraw(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      return null;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    this.canvasGraphicService.clearCanvas({ ctx, canvasWidth, canvasHeight });
    this.canvasGraphicService.drawCheckerboard({
      ctx,
      canvasWidth,
      canvasHeight,
      cellSize: 32,
      blackColor: '#ccc',
      whiteColor: '#fff',
    });

    if (!this.content.image) {
      return ctx;
    }
    const imageDrawRegion = this.regionSelectorGeometryService.calculateImageDrawRegion(canvas, this.content);
    ctx.drawImage(this.content.image, imageDrawRegion.dx, imageDrawRegion.dy, imageDrawRegion.dw, imageDrawRegion.dh);

    if (this.content.isRegionListVisible) {
      this.content.regionList.forEach((_, index) => {
        if (index === this.regionIDToEdit) {
          return;
        }
        this.regionSelectorGraphicService.drawRegion(canvas, ctx, this.content, index);
      });
    }

    this.regionSelectorGraphicService.drawDrawnShapeList(canvas, canvasWidth, canvasHeight, ctx, this.content);

    if (this.shapeIDToAddNewVertex === null) {
      this.drawNearestVertexWithOpenNeighbor(canvas, canvasWidth, canvasHeight, ctx);
    } else {
      this.drawLastAddedVertex(canvas, canvasWidth, canvasHeight, ctx);
    }

    canvas.style.cursor = 'crosshair';

    return ctx;
  }

  private drawNearestVertexWithOpenNeighbor(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const nearestVertexWithOpenNeighborInfo = this.getNearestVertexWithOpenNeighbor(this.content.cursorImagePosition);
    if (nearestVertexWithOpenNeighborInfo === null) {
      return;
    }
    const polygon = this.content.drawnShapeList[nearestVertexWithOpenNeighborInfo.polygonID];
    const polygonVertices = polygon.getVertices();
    const vertex = polygonVertices[nearestVertexWithOpenNeighborInfo.vertexID];
    const vertexCanvasPos = this.regionSelectorGeometryService.imageToCanvasPosition(canvas, this.content, vertex);
    this.canvasGraphicService.drawCircle({
      canvasWidth,
      canvasHeight,
      ctx,
      center: vertexCanvasPos,
      lineColor: '#f5222d',
      fillColor: '#a8071a',
      radius: 5,
    });
  }

  private drawLastAddedVertex(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    if (this.shapeIDToAddNewVertex === null) {
      return;
    }
    const polygonToAdd = this.content.drawnShapeList[this.shapeIDToAddNewVertex];
    const polygonToAddVertices = polygonToAdd.getVertices();
    const lastAddedVertex = polygonToAddVertices[polygonToAddVertices.length - 1];
    const lastAddedVertexCanvasPos = this.regionSelectorGeometryService.imageToCanvasPosition(
      canvas,
      this.content,
      lastAddedVertex
    );
    this.canvasGraphicService.drawCircle({
      canvasWidth,
      canvasHeight,
      ctx,
      center: lastAddedVertexCanvasPos,
      lineColor: '#f5222d',
      fillColor: '#a8071a',
      radius: 5,
    });
  }

  private getNearestVertexWithOpenNeighbor(coordinate: Coordinate): {
    polygonID: number;
    vertexID: number;
    openVertexID: number;
    isOpenVertexPrevious: boolean;
  } | null {
    let minVertexDistanceToCoordinate = VERTICES_AUTO_CONNECT_DISTANCE;
    let result = null;
    for (let polygonID = 0; polygonID < this.content.drawnShapeList.length; polygonID++) {
      const polygon = this.content.drawnShapeList[polygonID];
      if (!(polygon instanceof FreePolygon)) {
        continue;
      }

      const polygonVertices = polygon.getVertices();
      for (let vertexID = 0; vertexID < polygonVertices.length; vertexID++) {
        const vertex = polygonVertices[vertexID];
        const vertexDistanceToCoordinate = this.geometryService.getDistance(vertex, coordinate);
        if (vertexDistanceToCoordinate >= minVertexDistanceToCoordinate) {
          continue;
        }
        const openNeighborVertexInfo = this.geometryService.getOpenNeighborVertexID(
          polygon,
          vertexID,
          VERTICES_MAX_DISTANCE
        );
        if (openNeighborVertexInfo === null) {
          continue;
        }
        minVertexDistanceToCoordinate = vertexDistanceToCoordinate;
        result = {
          polygonID: polygonID,
          vertexID: vertexID,
          openVertexID: openNeighborVertexInfo.vertexID,
          isOpenVertexPrevious: openNeighborVertexInfo.isOpenVertexPrevious,
        };
      }
    }
    return result;
  }
}
