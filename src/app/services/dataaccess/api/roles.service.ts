import { Injectable } from '@angular/core';
import { Axios } from 'axios';
import { UserPermission, UserRole } from './schemas';

export enum UserRoleListSortOrder {
  ID_ASCENDING = 0,
  ID_DESCENDING = 1,
  DISPLAY_NAME_ASCENDING = 2,
  DISPLAY_NAME_DESCENDING = 3,
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private readonly axios: Axios) {}

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

  public async deleteUserRole(id: number): Promise<void> {
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
