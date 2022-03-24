import { Polygon } from './polygon';
import { RegionLabel } from './region_label';
import { User } from './user';

export class RegionOperationLogDrawMetadata {
  constructor(
    public oldBorder: Polygon | null,
    public oldHoles: Polygon[] | null,
    public newBorder: Polygon,
    public newHoles: Polygon[]
  ) {}

  public static fromJSON(metadataJSON: any): RegionOperationLogDrawMetadata {
    return new RegionOperationLogDrawMetadata(
      metadataJSON.old_border
        ? Polygon.fromJSON(metadataJSON.old_border)
        : null,
      metadataJSON.old_holes
        ? metadataJSON.old_holes.map(Polygon.fromJSON)
        : null,
      Polygon.fromJSON(metadataJSON.new_border),
      metadataJSON.new_holes.map(Polygon.fromJSON)
    );
  }
}

export class RegionOperationLogLabelMetadata {
  constructor(
    public oldLabel: RegionLabel | null,
    public newLabel: RegionLabel | null
  ) {}

  public static fromJSON(metadataJSON: any): RegionOperationLogLabelMetadata {
    return new RegionOperationLogLabelMetadata(
      metadataJSON.old_label
        ? RegionLabel.fromJSON(metadataJSON.old_label)
        : null,
      metadataJSON.new_label
        ? RegionLabel.fromJSON(metadataJSON.new_label)
        : null
    );
  }
}

export enum OperationType {
  DRAW = 0,
  LABEL = 1,
}

export class RegionOperationLog {
  constructor(
    public id: number,
    public byUser: User | null,
    public operationTime: number,
    public operationType: OperationType,
    public operationMetadata:
      | RegionOperationLogDrawMetadata
      | RegionOperationLogLabelMetadata
  ) {}

  public static fromJSON(logJSON: any): RegionOperationLog {
    const id = logJSON.id || 0;
    const byUser = logJSON.by_user ? User.fromJSON(logJSON.by_user) : null;
    const operationTime = logJSON.operation_time || 0;
    const operationType = logJSON.operation_type || OperationType;
    const operationMetadata =
      operationType === OperationType.DRAW
        ? RegionOperationLogDrawMetadata.fromJSON(logJSON.operation_metadata)
        : RegionOperationLogLabelMetadata.fromJSON(logJSON.operation_metadata);
    return new RegionOperationLog(
      id,
      byUser,
      operationTime,
      operationType,
      operationMetadata
    );
  }
}
