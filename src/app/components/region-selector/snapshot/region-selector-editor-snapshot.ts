import { Polygon } from '../models';

export class RegionSelectorSnapshot {
  constructor(public readonly drawnRegionList: Polygon[]) {}
}
