import { Injectable } from '@angular/core';
import { Axios } from 'axios';
import { UserPermission } from './schemas';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  constructor(private readonly axios: Axios) {}

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
    permissionName: string | undefined,
    description: string | undefined
  ): Promise<UserPermission> {
    throw new Error('not implemented');
  }

  public async deleteUserPermission(id: number): Promise<void> {
    throw new Error('not implemented');
  }
}
