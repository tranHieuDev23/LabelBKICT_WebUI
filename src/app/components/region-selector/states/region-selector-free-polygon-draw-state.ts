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
} from '../common/constants';
import { EditState } from './region-selector-edit-state';
import { RegionSelectorState } from './region-selector-state';

export class FreePolygonDrawState extends EditState {
  constructor(
    public override readonly content: RegionSelectorContent,
    public override readonly regionIDToEdit: number | null,
    public readonly shapeIDToAddNewVertex: number | null,
    private readonly snapshotService: RegionSelectorSnapshotService,
    protected override readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    protected override readonly geometryService: GeometryService,
    protected override readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    protected override readonly canvasGraphicService: CanvasGraphicService
  ) {
    super(
      content,
      regionIDToEdit,
      regionSelectorGeometryService,
      geometryService,
      regionSelectorGraphicService,
      canvasGraphicService
    );
  }

  public onLeftMouseDown(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): RegionSelectorState {
    const cursorMousePosition = this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
      canvas,
      this.content,
      cursorMousePosition
    );

    if (!this.isPointInsideMarginAndBoundary(cursorImagePosition)) {
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

    const newVertex = this.movePointInsideMarginAndBoundary(canvas, cursorMousePosition, cursorImagePosition);
    return this.withNewVertex(newVertex);
  }

  private movePointInsideMarginAndBoundary(
    canvas: HTMLCanvasElement,
    cursorMousePosition: Coordinate,
    cursorImagePosition: Coordinate
  ): Coordinate {
    if (this.content.drawBoundaryEnabled && !this.content.drawBoundary.isPointInside(cursorImagePosition)) {
      const boundary = this.content.drawBoundary;
      const boundaryCenterMousePosition = this.regionSelectorGeometryService.imageToMousePosition(
        canvas,
        this.content,
        boundary.center
      );
      const cursorBoundaryCenterMouseDistance = this.geometryService.getDistance(
        boundaryCenterMousePosition,
        cursorMousePosition
      );
      const boundaryMouseRadius = this.regionSelectorGeometryService.imageToMouseDistance(
        canvas,
        this.content,
        boundary.center,
        { x: boundary.center.x + boundary.radiusX, y: boundary.center.y }
      );
      const newDeltaX =
        ((cursorMousePosition.x - boundaryCenterMousePosition.x) / cursorBoundaryCenterMouseDistance) *
        boundaryMouseRadius;
      const newDeltaY =
        ((cursorMousePosition.y - boundaryCenterMousePosition.y) / cursorBoundaryCenterMouseDistance) *
        boundaryMouseRadius;
      const newCursorMousePosition = {
        x: boundaryCenterMousePosition.x + newDeltaX,
        y: boundaryCenterMousePosition.y + newDeltaY,
      };
      cursorImagePosition = this.regionSelectorGeometryService.mouseToImagePosition(
        canvas,
        this.content,
        newCursorMousePosition
      );
    }

    if (this.content.drawMarginEnabled) {
      cursorImagePosition.x = Math.min(
        Math.max(cursorImagePosition.x, this.content.drawMargin.left),
        this.content.drawMargin.right
      );
      cursorImagePosition.y = Math.min(
        Math.max(cursorImagePosition.y, this.content.drawMargin.bottom),
        this.content.drawMargin.top
      );
    }

    return cursorImagePosition;
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

  private isPointInsideMarginAndBoundary(position: Coordinate): boolean {
    if (this.content.drawMarginEnabled && !this.content.drawMargin.isPointInside(position)) {
      return false;
    }

    if (this.content.drawBoundaryEnabled && !this.content.drawBoundary.isPointInside(position)) {
      return false;
    }

    return true;
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

  public override onDraw(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = super.onDraw(canvas);
    if (ctx === null) {
      return null;
    }
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
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
      strokeStyle: '#f5222d',
      fillStyle: '#a8071a',
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
      strokeStyle: '#f5222d',
      fillStyle: '#a8071a',
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
