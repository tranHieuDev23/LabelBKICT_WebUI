import { Injectable } from '@angular/core';
import { RolesService, UsersService, UserRole, UserRoleListSortOrder, UserPermission } from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class UserRoleManagementService {
  constructor(
    private readonly rolesDataAccessService: RolesService,
    private readonly usersDataAccessService: UsersService
  ) {}

  public isValidDisplayName(permissionName: string): { [k: string]: boolean } | null {
    if (permissionName.length > 256) {
      return { error: true, maxLength: true };
    }
    return null;
  }

  public isValidDescription(description: string): { [k: string]: boolean } | null {
    if (description.length > 256) {
      return { error: true, maxLength: true };
    }
    return null;
  }

  public async createUserRole(displayName: string, description: string): Promise<UserRole> {
    return await this.rolesDataAccessService.createUserRole(displayName.trim(), description.trim());
  }

  public async getUserRoleList(
    offset: number,
    limit: number,
    sortOrder: UserRoleListSortOrder,
    withUserPermission: boolean
  ): Promise<{
    totalUserRoleCount: number;
    userRoleList: UserRole[];
    userPermissionList: UserPermission[][] | undefined;
  }> {
    return await this.rolesDataAccessService.getUserRoleList(offset, limit, sortOrder, withUserPermission);
  }

  public async updateUserRole(id: number, displayName: string, description: string): Promise<UserRole> {
    if (displayName !== undefined) displayName = displayName.trim();
    if (description !== undefined) description = description.trim();
    return await this.rolesDataAccessService.updateUserRole(id, displayName, description);
  }

  public async deleteUserRole(id: number): Promise<void> {
    return await this.rolesDataAccessService.deleteUserRole(id);
  }

  public async addUserRoleToUser(userID: number, userRoleID: number): Promise<void> {
    await this.usersDataAccessService.addUserRoleToUser(userID, userRoleID);
  }

  public async removeUserRoleFromUser(userID: number, userRoleID: number): Promise<void> {
    await this.usersDataAccessService.removeUserRoleFromUser(userID, userRoleID);
  }
}
