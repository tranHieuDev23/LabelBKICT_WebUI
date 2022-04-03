import { User } from './user';

export enum ExportType {
  DATASET = 0,
  EXCEL = 1,
}

export enum ExportStatus {
  REQUESTED = 0,
  PROCESSING = 1,
  DONE = 2,
}

export class Export {
  constructor(
    public id: number,
    public requestedByUser: User,
    public type: ExportType,
    public requestTime: number,
    public status: ExportStatus,
    public expireTime: number,
    public exportedFileFilename: string
  ) {}

  public static fromJSON(exportJSON: any): Export {
    return new Export(
      exportJSON.id || 0,
      User.fromJSON(exportJSON.requested_by_user),
      exportJSON.type || ExportType.DATASET,
      exportJSON.request_time || 0,
      exportJSON.status || ExportStatus.REQUESTED,
      exportJSON.expire_time || 0,
      exportJSON.exported_file_filename || ''
    );
  }
}
