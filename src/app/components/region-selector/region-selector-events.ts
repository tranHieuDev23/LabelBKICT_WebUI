import { Shape } from './models';

export class RegionSelectedEvent {
  constructor(public border: Shape, public holeList: Shape[]) {}
}

export class RegionEditedEvent {
  constructor(
    public regionID: number,
    public newBorder: Shape,
    public newHoleList: Shape[]
  ) {}
}

export class RegionClickedEvent {
  constructor(
    public isDrawnPolygonClicked: boolean,
    public regionID: number | null,
    public event: MouseEvent
  ) {}
}
