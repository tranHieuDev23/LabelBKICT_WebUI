import { Polygon } from './models';

export class RegionSelectedEvent {
  constructor(public polygonList: Polygon[]) {}
}

export class RegionEditedEvent {
  constructor(public regionID: number, public newPolygonList: Polygon[]) {}
}

export class RegionClickedEvent {
  constructor(
    public isDrawnPolygonClicked: boolean,
    public regionID: number | null,
    public event: MouseEvent
  ) {}
}
