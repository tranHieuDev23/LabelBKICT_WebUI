export class ImageType {
  constructor(
    public id: number,
    public displayName: string,
    public hasPredictiveModel: boolean
  ) {}

  public static fromJSON(imageTypeJSON: any): ImageType {
    return new ImageType(
      imageTypeJSON.id || 0,
      imageTypeJSON.display_name || '',
      imageTypeJSON.has_predictive_model || false
    );
  }
}
