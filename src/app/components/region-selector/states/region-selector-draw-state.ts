import { GeometryService } from '../geometry/geometry.service';
import { RegionSelectorGeometryService } from '../geometry/region-selector-geometry.service';
import { CanvasGraphicService } from '../graphic/canvas-graphic.service';
import { RegionSelectorGraphicService } from '../graphic/region-selector-graphic.service';
import { Coordinate } from '../models';
import { RegionSelectorContent } from '../region-selector-content';
import { RegionSelectorEditorSnapshot } from '../snapshot/region-selector-editor-snapshot';
import { RegionSelectorSnapshotService } from '../snapshot/region-selector-snapshot.service';
import { RegionSelectorState } from './region-selector-state';

const VERTICES_MIN_DISTANCE = 1e-3;
const VERTICES_MAX_DISTANCE = 1e-2;
const VERTICES_AUTO_CONNECT_DISTANCE = VERTICES_MAX_DISTANCE;
const MINIMUM_NEW_VERTICES_PER_DRAW = 10;
const DELETE_VERTICES_MOUSE_DISTANCE = 10;
const DRAWN_POLYGON_COLOR_LIST = [
  '#c41d7f',
  '#531dab',
  '#096dd9',
  '#faad14',
  '#d4380d',
  '#08979c',
];

export class DrawState implements RegionSelectorState {
  constructor(
    public readonly content: RegionSelectorContent,
    public isAddingVertex: boolean,
    private polygonIDToAddNewVertex: number | null,
    private readonly snapshotService: RegionSelectorSnapshotService,
    private readonly regionSelectorGeometryService: RegionSelectorGeometryService,
    private readonly geometryService: GeometryService,
    private readonly regionSelectorGraphicService: RegionSelectorGraphicService,
    private readonly canvasGraphicService: CanvasGraphicService
  ) {}

  public onLeftMouseDown(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState {
    if (this.isAddingVertex) {
      return this.onLeftMouseDownAddingVertex(canvas, event);
    } else {
      return this.onLeftMouseDownDeletingVertex();
    }
  }

  private onLeftMouseDownAddingVertex(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState {
    const cursorMousePosition =
      this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition =
      this.regionSelectorGeometryService.mouseToImagePosition(
        canvas,
        this.content,
        cursorMousePosition
      );
    return this.polygonIDToAddNewVertex === null
      ? this.getDrawStateWithFirstVertex(cursorImagePosition)
      : this.getDrawStateWithNewVertex(cursorImagePosition);
  }

  private onLeftMouseDownDeletingVertex(): RegionSelectorState {
    return new DrawState(
      this.content,
      false,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  public onMouseMove(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent,
    isLeftMouseDown: boolean
  ): RegionSelectorState {
    if (!isLeftMouseDown) {
      const cursorMousePosition =
        this.regionSelectorGeometryService.getMousePositionFromMouseEvent(
          event
        );
      const cursorImagePosition =
        this.regionSelectorGeometryService.mouseToImagePosition(
          canvas,
          this.content,
          cursorMousePosition
        );
      const newContent = { ...this.content };
      newContent.cursorImagePosition = cursorImagePosition;
      return new DrawState(
        newContent,
        this.isAddingVertex,
        this.polygonIDToAddNewVertex,
        this.snapshotService,
        this.regionSelectorGeometryService,
        this.geometryService,
        this.regionSelectorGraphicService,
        this.canvasGraphicService
      );
    }

    if (this.isAddingVertex) {
      return this.onMouseMoveAddingVertex(canvas, event);
    } else {
      return this.onMouseMoveDeletingVertex(canvas, event);
    }
  }

  private onMouseMoveAddingVertex(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState {
    if (this.polygonIDToAddNewVertex === null) {
      return this;
    }
    const cursorMousePosition =
      this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const cursorImagePosition =
      this.regionSelectorGeometryService.mouseToImagePosition(
        canvas,
        this.content,
        cursorMousePosition
      );
    return this.getDrawStateWithNewVertex(cursorImagePosition);
  }

  public onMouseMoveDeletingVertex(
    canvas: HTMLCanvasElement,
    event: MouseEvent | TouchEvent
  ): RegionSelectorState {
    const mousePos =
      this.regionSelectorGeometryService.getMousePositionFromMouseEvent(event);
    const mouseImagePos =
      this.regionSelectorGeometryService.mouseToImagePosition(
        canvas,
        this.content,
        mousePos
      );

    // Remove all vertices within cursor size
    const drawnPolygonListWithNo2Openings = this.content.drawnPolygonList.map(
      (polygon) => {
        return {
          vertices: polygon.vertices.filter((vertex) => {
            const vertexMousePos =
              this.regionSelectorGeometryService.imageToMousePosition(
                canvas,
                this.content,
                vertex
              );
            return (
              this.geometryService.getDistance(vertexMousePos, mousePos) >
              DELETE_VERTICES_MOUSE_DISTANCE
            );
          }),
        };
      }
    );

    // Remove all empty polygon
    const drawnPolygonListWithNoEmpty = drawnPolygonListWithNo2Openings.filter(
      (polygon) => polygon.vertices.length > 0
    );

    const newContent = { ...this.content };
    newContent.cursorImagePosition = mouseImagePos;
    newContent.drawnPolygonList = drawnPolygonListWithNoEmpty;
    return new DrawState(
      newContent,
      false,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  public onLeftMouseUp(): RegionSelectorState {
    if (this.isAddingVertex) {
      return this.onLeftMouseUpAddingVertex();
    } else {
      return this.onLeftMouseUpDeletingVertex();
    }
  }

  private onLeftMouseUpAddingVertex(): RegionSelectorState {
    if (this.polygonIDToAddNewVertex === null) {
      return this;
    }
    const lastSnapshot = this.snapshotService.getCurrentSnapshot();
    if (lastSnapshot !== null) {
      let lastSnapshotVerticesCount: number;
      if (lastSnapshot.drawnRegionList.length > this.polygonIDToAddNewVertex) {
        const lastSnapshotPolygon =
          lastSnapshot.drawnRegionList[this.polygonIDToAddNewVertex];
        lastSnapshotVerticesCount = lastSnapshotPolygon.vertices.length;
      } else {
        lastSnapshotVerticesCount = 0;
      }

      const currentVerticesCount =
        this.content.drawnPolygonList[this.polygonIDToAddNewVertex].vertices
          .length;
      if (
        currentVerticesCount <
        lastSnapshotVerticesCount + MINIMUM_NEW_VERTICES_PER_DRAW
      ) {
        const newContent = { ...this.content };
        if (lastSnapshotVerticesCount === 0) {
          newContent.drawnPolygonList.splice(this.polygonIDToAddNewVertex);
        } else {
          const lastSnapshotPolygon =
            lastSnapshot.drawnRegionList[this.polygonIDToAddNewVertex];
          newContent.drawnPolygonList[this.polygonIDToAddNewVertex] =
            lastSnapshotPolygon;
        }

        return new DrawState(
          newContent,
          true,
          null,
          this.snapshotService,
          this.regionSelectorGeometryService,
          this.geometryService,
          this.regionSelectorGraphicService,
          this.canvasGraphicService
        );
      }
    }

    this.snapshotService.storeSnapshot(
      new RegionSelectorEditorSnapshot(this.content.drawnPolygonList)
    );
    return new DrawState(
      this.content,
      true,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private onLeftMouseUpDeletingVertex(): RegionSelectorState {
    // Remove all vertices with 2 openings
    const drawnPolygonListWithNo2Openings = this.content.drawnPolygonList.map(
      (polygon) => {
        return {
          vertices: polygon.vertices.filter((vertex, index, vertices) => {
            const prevIndex = index === 0 ? vertices.length - 1 : index - 1;
            const prevVertex = vertices[prevIndex];
            const nextIndex = index === vertices.length - 1 ? 0 : index + 1;
            const nextVertex = vertices[nextIndex];
            return (
              this.geometryService.getDistance(vertex, prevVertex) <=
                VERTICES_MAX_DISTANCE ||
              this.geometryService.getDistance(vertex, nextVertex) <=
                VERTICES_MAX_DISTANCE
            );
          }),
        };
      }
    );

    // Remove all empty polygon
    const drawnPolygonListWithNoEmpty = drawnPolygonListWithNo2Openings.filter(
      (polygon) => polygon.vertices.length > 0
    );
    this.snapshotService.storeSnapshot(
      new RegionSelectorEditorSnapshot(drawnPolygonListWithNoEmpty)
    );

    const newContent = { ...this.content };
    newContent.drawnPolygonList = drawnPolygonListWithNoEmpty;
    return new DrawState(
      newContent,
      false,
      null,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private getDrawStateWithFirstVertex(
    cursorImagePosition: Coordinate
  ): RegionSelectorState {
    const newContent = { ...this.content };
    newContent.cursorImagePosition = cursorImagePosition;
    newContent.drawnPolygonList = [...newContent.drawnPolygonList];

    const nearestVertexWithOpenNeighborInfo =
      this.getNearestVertexWithOpenNeighbor(cursorImagePosition);
    if (nearestVertexWithOpenNeighborInfo === null) {
      // If there is no near vertex with open neighbor to connect to, create a new polygon with only the new vertex
      const polygonIDToAddNewVertex = newContent.drawnPolygonList.length;
      newContent.drawnPolygonList.push({ vertices: [cursorImagePosition] });
      return new DrawState(
        newContent,
        true,
        polygonIDToAddNewVertex,
        this.snapshotService,
        this.regionSelectorGeometryService,
        this.geometryService,
        this.regionSelectorGraphicService,
        this.canvasGraphicService
      );
    }

    let { polygonID, vertexID, openVertexID, isOpenVertexPrevious } =
      nearestVertexWithOpenNeighborInfo;
    const polygonToAdd = this.content.drawnPolygonList[polygonID];
    const vertexToConnect = polygonToAdd.vertices[vertexID];
    const inBetweenPointList = this.geometryService.getInBetweenPointList(
      vertexToConnect,
      cursorImagePosition,
      VERTICES_MAX_DISTANCE
    );
    if (isOpenVertexPrevious) {
      newContent.drawnPolygonList[polygonID] = {
        vertices: [
          ...polygonToAdd.vertices.slice(0, openVertexID).reverse(),
          ...polygonToAdd.vertices.slice(vertexID).reverse(),
          ...inBetweenPointList,
          cursorImagePosition,
        ],
      };
    } else {
      newContent.drawnPolygonList[polygonID] = {
        vertices: [
          ...polygonToAdd.vertices.slice(openVertexID),
          ...polygonToAdd.vertices.slice(0, vertexID),
          ...inBetweenPointList,
          cursorImagePosition,
        ],
      };
    }

    return new DrawState(
      newContent,
      true,
      polygonID,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  private getDrawStateWithNewVertex(
    cursorImagePosition: Coordinate
  ): RegionSelectorState {
    if (this.polygonIDToAddNewVertex === null) {
      return this;
    }

    const newContent = { ...this.content };
    newContent.cursorImagePosition = cursorImagePosition;

    const polygonToAdd =
      this.content.drawnPolygonList[this.polygonIDToAddNewVertex];
    const vertexToConnect =
      polygonToAdd.vertices[polygonToAdd.vertices.length - 1];
    if (
      this.geometryService.getDistance(vertexToConnect, cursorImagePosition) <
      VERTICES_MIN_DISTANCE
    ) {
      return this;
    }

    const inBetweenPointList = this.geometryService.getInBetweenPointList(
      vertexToConnect,
      cursorImagePosition,
      VERTICES_MAX_DISTANCE
    );
    newContent.drawnPolygonList = [...newContent.drawnPolygonList];
    newContent.drawnPolygonList[this.polygonIDToAddNewVertex] = {
      vertices: [
        ...polygonToAdd.vertices,
        ...inBetweenPointList,
        cursorImagePosition,
      ],
    };

    const currentVerticesCount =
      newContent.drawnPolygonList[this.polygonIDToAddNewVertex].vertices.length;
    if (currentVerticesCount > MINIMUM_NEW_VERTICES_PER_DRAW) {
      const openNeighborVertex =
        newContent.drawnPolygonList[this.polygonIDToAddNewVertex].vertices[0];
      if (
        this.geometryService.getDistance(
          openNeighborVertex,
          cursorImagePosition
        ) <= VERTICES_MAX_DISTANCE
      ) {
        // if cursor position is close enough to the next vertex, automatically connect to that vertex and stop drawing
        return new DrawState(
          newContent,
          true,
          null,
          this.snapshotService,
          this.regionSelectorGeometryService,
          this.geometryService,
          this.regionSelectorGraphicService,
          this.canvasGraphicService
        );
      }
    }

    return new DrawState(
      newContent,
      true,
      this.polygonIDToAddNewVertex,
      this.snapshotService,
      this.regionSelectorGeometryService,
      this.geometryService,
      this.regionSelectorGraphicService,
      this.canvasGraphicService
    );
  }

  public onDraw(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    this.canvasGraphicService.resizeCanvasMatchParent(canvas);
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
    const imageDrawRegion =
      this.regionSelectorGeometryService.calculateImageDrawRegion(
        canvas,
        this.content
      );
    ctx.drawImage(
      this.content.image,
      imageDrawRegion.dx,
      imageDrawRegion.dy,
      imageDrawRegion.dw,
      imageDrawRegion.dh
    );

    if (this.content.isRegionListVisible) {
      this.regionSelectorGraphicService.drawRegionList(
        canvas,
        ctx,
        this.content
      );
    }

    this.drawDrawnPolygonList(canvas, canvasWidth, canvasHeight, ctx);

    if (this.isAddingVertex) {
      this.drawLastAddedVertex(canvas, canvasWidth, canvasHeight, ctx);
    } else {
      this.drawDeleteCursor(canvas, canvasWidth, canvasHeight, ctx);
    }

    return ctx;
  }

  private drawDrawnPolygonList(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    for (let i = 0; i < this.content.drawnPolygonList.length; i++) {
      const polygon = this.content.drawnPolygonList[i];
      const regionColor =
        DRAWN_POLYGON_COLOR_LIST[
          Math.min(i, DRAWN_POLYGON_COLOR_LIST.length - 1)
        ];

      let lastVertex = polygon.vertices[polygon.vertices.length - 1];
      let lastVertexCanvasPos =
        this.regionSelectorGeometryService.imageToCanvasPosition(
          canvas,
          this.content,
          lastVertex
        );

      for (const vertex of polygon.vertices) {
        const vertexCanvasPos =
          this.regionSelectorGeometryService.imageToCanvasPosition(
            canvas,
            this.content,
            vertex
          );
        this.canvasGraphicService.drawCircle({
          canvasWidth,
          canvasHeight,
          ctx,
          center: vertexCanvasPos,
          radius: 1,
          lineColor: regionColor,
          fillColor: regionColor,
        });

        if (
          this.geometryService.getDistance(lastVertex, vertex) <=
          VERTICES_MAX_DISTANCE
        ) {
          this.canvasGraphicService.drawLine({
            canvasWidth,
            canvasHeight,
            ctx,
            lineStart: lastVertexCanvasPos,
            lineEnd: vertexCanvasPos,
            lineColor: regionColor,
          });
        }

        lastVertex = vertex;
        lastVertexCanvasPos = vertexCanvasPos;
      }
    }
  }

  private drawLastAddedVertex(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    if (this.polygonIDToAddNewVertex === null) {
      return;
    }
    const polygonToAdd =
      this.content.drawnPolygonList[this.polygonIDToAddNewVertex];
    const lastAddedVertex =
      polygonToAdd.vertices[polygonToAdd.vertices.length - 1];
    const lastAddedVertexCanvasPos =
      this.regionSelectorGeometryService.imageToCanvasPosition(
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
      fillColor: 'a8071a',
      radius: 5,
    });
  }

  private drawDeleteCursor(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const cursorCanvasPos =
      this.regionSelectorGeometryService.imageToCanvasPosition(
        canvas,
        this.content,
        this.content.cursorImagePosition
      );
    this.canvasGraphicService.drawCircle({
      canvasWidth,
      canvasHeight,
      ctx,
      center: cursorCanvasPos,
      lineColor: '#ccc',
      radius: DELETE_VERTICES_MOUSE_DISTANCE,
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
    for (
      let polygonID = 0;
      polygonID < this.content.drawnPolygonList.length;
      polygonID++
    ) {
      const polygon = this.content.drawnPolygonList[polygonID];
      for (let vertexID = 0; vertexID < polygon.vertices.length; vertexID++) {
        const vertex = polygon.vertices[vertexID];
        const vertexDistanceToCoordinate = this.geometryService.getDistance(
          vertex,
          coordinate
        );
        if (vertexDistanceToCoordinate >= minVertexDistanceToCoordinate) {
          continue;
        }
        const openNeighborVertexInfo =
          this.geometryService.getOpenNeighborVertexID(
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
