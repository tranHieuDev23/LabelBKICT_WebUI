import { Injectable } from '@angular/core';
import {
  PermissionsService,
  RolesService,
  UserPermission,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class UserPermissionManagementService {
  constructor(
    private readonly permissionsDataAccessService: PermissionsService,
    private readonly rolesDataAccessService: RolesService
  ) {}

  public async createUserPermission(
    permissionName: string,
    description: string
  ): Promise<UserPermission> {
    throw new Error('not implemented');
  }

  public async getUserPermissionList(): Promise<{
    userPermissionList: UserPermission[];
  }> {
    throw new Error('not implemented');
  }

  public async updateUserPermission(
    id: number,
    permissionName: string,
    description: string
  ): Promise<UserPermission> {
    throw new Error('not implemented');
  }

  public async deleteUserPermission(id: number): Promise<void> {
    throw new Error('not implemented');
  }

  public async addUserPermissionToUserRole(
    userRoleID: number,
    userPermissionID: number
  ): Promise<void> {
    throw new Error('not implemented');
  }

  public async removeUserPermissionFromUserRole(
    userRoleID: number,
    userPermissionID: number
  ): Promise<void> {
    throw new Error('not implemented');
  }
}
