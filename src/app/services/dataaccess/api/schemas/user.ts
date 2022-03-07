export class User {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly displayName: string
  ) {}

  public static fromJSON(userJSON: any): User {
    return new User(
      userJSON?.id || 0,
      userJSON?.username || '',
      userJSON?.display_name || ''
    );
  }
}
