import { Image } from './image';

export enum DetectionTaskStatus {
  REQUESTED = 0,
  PROCESSING = 1,
  DONE = 2,
}

export class DetectionTask {
  constructor(
    public id: number,
    public ofImage: Image,
    public requestTime: number,
    public status: DetectionTaskStatus,
    public updateTime: number
  ) {}

  public static fromJSON(obj: any): DetectionTask {
    return new DetectionTask(
      +obj.id,
      Image.fromJSON(obj.of_image),
      +obj.request_time,
      +obj.status as DetectionTaskStatus,
      +obj.update_time
    );
  }
}
