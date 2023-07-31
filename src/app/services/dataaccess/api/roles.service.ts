import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { UnauthenticatedError, UnauthorizedError, UnknownAPIError } from './errors';
import { UserPermission, UserRole } from './schemas';

export enum UserRoleListSortOrder {
  ID_ASCENDING = 0,
  ID_DESCENDING = 1,
  DISPLAY_NAME_ASCENDING = 2,
  DISPLAY_NAME_DESCENDING = 3,
}

export class InvalidUserRoleInformationError extends Error {
  constructor() {
    super('Invalid user role information');
  }
}

export class InvalidUserRoleListArgument extends Error {
  constructor() {
    super('Invalid argument to retrieve user role list');
  }
}

export class UserRoleNotFoundError extends Error {
  constructor() {
    super('Cannot find user role');
  }
}

export class UserRoleOrUserPermissionNotFoundError extends Error {
  constructor() {
    super('Cannot find user role or user permission');
  }
}

export class UserRoleAlreadyHasUserPermissionError extends Error {
  constructor() {
    super('User role already has user permission');
  }
}

export class UserRoleDoesNotHaveUserPermissionError extends Error {
  constructor() {
    super('User role does not have user permission');
  }
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private readonly axios: Axios) {}

  public async createUserRole(displayName: string, description: string): Promise<UserRole> {
    try {
      const response = await this.axios.post('/api/roles', {
        display_name: displayName,
        description: description,
      });
      return UserRole.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserRoleInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
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
    try {
      const response = await this.axios.get('/api/roles', {
        params: {
          offset: offset,
          limit: limit,
          sort_order: sortOrder,
          with_user_permission: withUserPermission ? 1 : 0,
        },
      });

      const totalUserRoleCount = +response.data.total_user_role_count;
      const userRoleList = response.data.user_role_list.map(UserRole.fromJSON);
      if (!withUserPermission) {
        return {
          totalUserRoleCount,
          userRoleList,
          userPermissionList: undefined,
        };
      }

      const userPermissionJSONList = response.data.user_permission_list as any[];
      const userPermissionList = userPermissionJSONList.map((list) => list.map(UserPermission.fromJSON));
      return { totalUserRoleCount, userRoleList, userPermissionList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserRoleListArgument();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateUserRole(
    id: number,
    displayName: string | undefined,
    description: string | undefined
  ): Promise<UserRole> {
    try {
      const response = await this.axios.patch(`/api/roles/${id}`, {
        display_name: displayName,
        description: description,
      });
      return UserRole.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserRoleInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserRoleNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteUserRole(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/roles/${id}`);
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
          throw new UserRoleNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addUserPermissionToUserRole(userRoleID: number, userPermissionID: number): Promise<void> {
    try {
      await this.axios.post(`/api/roles/${userRoleID}/permissions`, {
        user_permission_id: userPermissionID,
      });
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
          throw new UserRoleOrUserPermissionNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserRoleAlreadyHasUserPermissionError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeUserPermissionFromUserRole(userRoleID: number, userPermissionID: number): Promise<void> {
    try {
      await this.axios.delete(`/api/roles/${userRoleID}/permissions/${userPermissionID}`);
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
          throw new UserRoleOrUserPermissionNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserRoleDoesNotHaveUserPermissionError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
