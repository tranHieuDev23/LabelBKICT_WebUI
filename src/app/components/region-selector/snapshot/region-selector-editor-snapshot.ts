import { Polygon } from '../models';

export class RegionSelectorEditorSnapshot {
  constructor(public readonly drawnRegionList: Polygon[]) {}
}
