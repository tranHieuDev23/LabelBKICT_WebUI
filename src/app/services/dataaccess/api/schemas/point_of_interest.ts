import { Vertex } from './polygon';
import { User } from './user';

export class PointOfInterest {
  constructor(
    public id: number,
    public createdByUser: User,
    public createdTime: number,
    public updatedTime: number,
    public coordinate: Vertex,
    public description: string
  ) {}

  public static fromJSON(poiJSON: any): PointOfInterest {
    return new PointOfInterest(
      poiJSON.id || 0,
      User.fromJSON(poiJSON.created_by_user),
      poiJSON.created_time || 0,
      poiJSON.updated_time || 0,
      Vertex.fromJSON(poiJSON.coordinate),
      poiJSON.description || ''
    );
  }
}
