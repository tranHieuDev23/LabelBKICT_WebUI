export class ImageBookmark {
  constructor(public description: string) {}

  public static fromJSON(imageBookmarkJSON: any): ImageBookmark {
    return new ImageBookmark(imageBookmarkJSON.description || '');
  }
}
