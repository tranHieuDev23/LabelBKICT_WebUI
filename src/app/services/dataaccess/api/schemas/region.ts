import { Polygon } from './polygon';
import { RegionLabel } from './region_label';
import { User } from './user';

export class Region {
  constructor(
    public id: number,
    public drawnByUser: User | null,
    public labeledByUser: User | null,
    public border: Polygon,
    public holes: Polygon[],
    public label: RegionLabel | null
  ) {}

  public static fromJSON(regionJSON: any): Region {
    return new Region(
      regionJSON.id || 0,
      regionJSON.drawn_by_user ? User.fromJSON(regionJSON.drawn_by_user) : null,
      regionJSON.labeled_by_user ? User.fromJSON(regionJSON.labeled_by_user) : null,
      Polygon.fromJSON(regionJSON.border),
      (regionJSON.holes || []).map(Polygon.fromJSON),
      regionJSON.label ? RegionLabel.fromJSON(regionJSON.label) : null
    );
  }
}
