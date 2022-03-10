import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { UserPermission } from './schemas';

export class InvalidUserPermissionInformationError extends Error {
  constructor() {
    super('Invalid user role information');
  }
}

export class UserPermissionNotFoundError extends Error {
  constructor() {
    super('Cannot find user permission');
  }
}
@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  constructor(private readonly axios: Axios) {}

  public async createUserPermission(
    permissionName: string,
    description: string
  ): Promise<UserPermission> {
    try {
      const response = await this.axios.post('/api/permissions', {
        permission_name: permissionName,
        description: description,
      });
      return UserPermission.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserPermissionInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserPermissionList(): Promise<{
    userPermissionList: UserPermission[];
  }> {
    try {
      const response = await this.axios.get('/api/permissions');
      return response.data.user_permission_list.map(UserPermission.fromJSON);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateUserPermission(
    id: number,
    permissionName: string | undefined,
    description: string | undefined
  ): Promise<UserPermission> {
    try {
      const response = await this.axios.patch(`/api/permissions/${id}`, {
        permission_name: permissionName,
        description: description,
      });
      return UserPermission.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserPermissionInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserPermissionNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteUserPermission(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/permissions/${id}`);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserPermissionNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
