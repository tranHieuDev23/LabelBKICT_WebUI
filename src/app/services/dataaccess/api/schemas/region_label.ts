export class RegionLabel {
  constructor(
    public id: number,
    public displayName: string,
    public color: string
  ) {}

  public static fromJSON(regionLabelJSON: any): RegionLabel {
    return new RegionLabel(
      regionLabelJSON.id || 0,
      regionLabelJSON.display_name || '',
      regionLabelJSON.color || ''
    );
  }
}
