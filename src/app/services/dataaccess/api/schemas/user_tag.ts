export class UserTag {
  constructor(
    public readonly id: number,
    public readonly displayName: string,
    public readonly description: string
  ) {}

  public static fromJSON(userTagJSON: any): UserTag {
    return new UserTag(
      userTagJSON.id || 0,
      userTagJSON.display_name || '',
      userTagJSON.description || ''
    );
  }
}
