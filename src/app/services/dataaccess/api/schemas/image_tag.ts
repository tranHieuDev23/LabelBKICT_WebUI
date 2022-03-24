export class ImageTag {
  constructor(public id: number, public displayName: string) {}

  public static fromProto(imageTagJSON: any): ImageTag {
    return new ImageTag(imageTagJSON.id || 0, imageTagJSON.display_name || '');
  }
}
