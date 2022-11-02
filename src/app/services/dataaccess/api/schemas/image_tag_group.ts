export class ImageTagGroup {
  constructor(
    public id: number,
    public displayName: string,
    public isSingleValue: boolean
  ) {}

  public static fromJSON(imageTagGroupJSON: any): ImageTagGroup {
    return new ImageTagGroup(
      imageTagGroupJSON.id || 0,
      imageTagGroupJSON.display_name || '',
      imageTagGroupJSON.is_single_value || false
    );
  }
}
