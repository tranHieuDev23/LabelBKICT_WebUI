import { Injectable } from '@angular/core';
import {
  RolesService,
  UsersService,
  UserRole,
  UserRoleListSortOrder,
  UserPermission,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class UserRoleManagementService {
  constructor(
    private readonly rolesDataAccessService: RolesService,
    private readonly userDataAccessService: UsersService
  ) {}

  public async createUserRole(
    displayName: string,
    description: string
  ): Promise<UserRole> {
    throw new Error('not implemented');
  }

  public async getUserRoleList(
    offset: number,
    limit: number,
    sortOrder: UserRoleListSortOrder,
    withUserPermission: boolean
  ): Promise<{
    totalUserRoleCount: number;
    userRoleList: UserRole[];
    userPermissionList: UserPermission[][];
  }> {
    throw new Error('not implemented');
  }

  public async updateUserRole(
    id: number,
    displayName: string,
    description: string
  ): Promise<UserRole> {
    throw new Error('not implemented');
  }

  public async addUserRoleToUser(
    userID: number,
    userRoleID: number
  ): Promise<void> {
    throw new Error('not implemented');
  }

  public async removeUserRoleFromUser(
    userID: number,
    userRoleID: number
  ): Promise<void> {
    throw new Error('not implemented');
  }
}
