export class UserRole {
  constructor(
    public readonly id: number,
    public readonly displayName: string,
    public readonly description: string
  ) {}

  public static fromJSON(userRoleJSON: any): UserRole {
    return new UserRole(
      userRoleJSON?.id || 0,
      userRoleJSON?.display_name || '',
      userRoleJSON?.description || ''
    );
  }
}
