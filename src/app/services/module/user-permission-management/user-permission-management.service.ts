import { Injectable } from '@angular/core';
import validator from 'validator';
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

  public isValidPermissionName(
    permissionName: string
  ): { [k: string]: boolean } | null {
    if (permissionName.length > 256) {
      return { error: true, maxLength: true };
    }
    if (!/^[a-zA-Z0-9_.]*$/.test(permissionName)) {
      return { error: true, pattern: true };
    }
    if (permissionName.startsWith('.')) {
      return { error: true, startDot: true };
    }
    if (permissionName.endsWith('.')) {
      return { error: true, endDot: true };
    }
    if (validator.contains(permissionName, '..')) {
      return { error: true, twoDot: true };
    }
    return null;
  }

  public isValidDescription(
    description: string
  ): { [k: string]: boolean } | null {
    if (description.length > 256) {
      return { error: true, maxLength: true };
    }
    return null;
  }

  public async createUserPermission(
    permissionName: string,
    description: string
  ): Promise<UserPermission> {
    return this.permissionsDataAccessService.createUserPermission(
      permissionName.trim(),
      description.trim()
    );
  }

  public async getUserPermissionList(): Promise<UserPermission[]> {
    return await this.permissionsDataAccessService.getUserPermissionList();
  }

  public async updateUserPermission(
    id: number,
    permissionName: string | undefined,
    description: string | undefined
  ): Promise<UserPermission> {
    if (permissionName !== undefined) permissionName = permissionName.trim();
    if (description !== undefined) description = description.trim();
    return this.permissionsDataAccessService.updateUserPermission(
      id,
      permissionName,
      description
    );
  }

  public async deleteUserPermission(id: number): Promise<void> {
    await this.permissionsDataAccessService.deleteUserPermission(id);
  }

  public async addUserPermissionToUserRole(
    userRoleID: number,
    userPermissionID: number
  ): Promise<void> {
    await this.rolesDataAccessService.addUserPermissionToUserRole(
      userRoleID,
      userPermissionID
    );
  }

  public async removeUserPermissionFromUserRole(
    userRoleID: number,
    userPermissionID: number
  ): Promise<void> {
    await this.rolesDataAccessService.removeUserPermissionFromUserRole(
      userRoleID,
      userPermissionID
    );
  }
}
