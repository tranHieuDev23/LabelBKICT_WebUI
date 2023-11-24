import { RegionSelectorElement } from './common/constants';
import { Coordinate, Shape } from './models';

export class RegionSelectedEvent {
  constructor(public border: Shape, public holeList: Shape[]) {}
}

export class RegionEditedEvent {
  constructor(public regionID: number, public newBorder: Shape, public newHoleList: Shape[]) {}
}

export class RegionSelectorClickedEvent {
  constructor(
    public element: RegionSelectorElement | null,
    public elementID: number | null,
    public event: MouseEvent,
    public mouseImagePos: Coordinate
  ) {}
}
