export class PinnedPage {
  constructor(
    public id: number,
    public pinTime: number,
    public url: string,
    public description: string,
    public screenshotURL: string
  ) {}

  public static fromJSON(pinnedPageJSON: any): PinnedPage {
    return new PinnedPage(
      pinnedPageJSON.id || 0,
      pinnedPageJSON.pin_time || 0,
      pinnedPageJSON.url || '',
      pinnedPageJSON.description || '',
      pinnedPageJSON.screenshot_url || ''
    );
  }
}
