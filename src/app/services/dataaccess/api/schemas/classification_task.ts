export enum ClassificationTaskStatus {
    REQUESTED = 0,
    DONE = 1,
  }
  
  export class ClassificationTaskImage {
    constructor(public id: number, public thumbnailURL: string) {}
  
    public static fromJSON(obj: any): ClassificationTaskImage {
      return new ClassificationTaskImage(+obj.id, `${obj.thumbnail_url}`);
    }
  }
  
  export class ClassificationTask {
    constructor(
      public id: number,
      public ofImage: ClassificationTaskImage,
      public ofClassificationTypeId: number,
      public requestTime: number,
      public status: ClassificationTaskStatus
    ) {}
  
    public static fromJSON(obj: any): ClassificationTask {
      return new ClassificationTask(
        +obj.id,
        ClassificationTaskImage.fromJSON(obj.of_image),
        +obj.of_classification_type_id,
        +obj.request_time,
        +obj.status as ClassificationTaskStatus
      );
    }
  }
  