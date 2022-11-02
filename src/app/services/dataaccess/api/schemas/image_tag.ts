export class ImageTag {
  constructor(public id: number, public displayName: string) {}

  public static fromJSON(imageTagJSON: any): ImageTag {
    return new ImageTag(imageTagJSON.id || 0, imageTagJSON.display_name || '');
  }
}
