export enum DetectionTaskStatus {
  REQUESTED = 0,
  PROCESSING = 1,
  DONE = 2,
}

export class DetectionTaskImage {
  constructor(public id: number, public thumbnailURL: string) {}

  public static fromJSON(obj: any): DetectionTaskImage {
    return new DetectionTaskImage(+obj.id, `${obj.thumbnail_url}`);
  }
}

export class DetectionTask {
  constructor(
    public id: number,
    public ofImage: DetectionTaskImage,
    public requestTime: number,
    public status: DetectionTaskStatus,
    public updateTime: number
  ) {}

  public static fromJSON(obj: any): DetectionTask {
    return new DetectionTask(
      +obj.id,
      DetectionTaskImage.fromJSON(obj.of_image),
      +obj.request_time,
      +obj.status as DetectionTaskStatus,
      +obj.update_time
    );
  }
}
