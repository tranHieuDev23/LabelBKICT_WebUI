import { Polygon } from './models';

export class RegionSelectedEvent {
  constructor(public border: Polygon, public holes: Polygon[]) {}
}

export class RegionEditedEvent {
  constructor(
    public regionID: number,
    public newBorder: Polygon,
    public newHoles: Polygon[]
  ) {}
}

export class RegionClickedEvent {
  constructor(
    public isDrawnPolygonClicked: boolean,
    public regionID: number | null,
    public event: MouseEvent
  ) {}
}
