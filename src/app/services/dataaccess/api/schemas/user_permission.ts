export class UserPermission {
  constructor(
    public readonly id: number,
    public readonly permissionName: string,
    public readonly description: string
  ) {}

  public static fromJSON(userPermissionJSON: any): UserPermission {
    return new UserPermission(
      userPermissionJSON?.id || 0,
      userPermissionJSON?.permission_name || '',
      userPermissionJSON?.description || ''
    );
  }
}
