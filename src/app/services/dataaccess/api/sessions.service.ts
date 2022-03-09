import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { UnauthenticatedError, UnknownAPIError } from './errors';
import { User, UserPermission, UserRole } from './schemas';

export class UsernameNotFoundError extends Error {
  constructor() {
    super('No user with the provided username found');
  }
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super('Incorrect password');
  }
}

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  constructor(private readonly axios: Axios) {}

  public async loginWithPassword(
    username: string,
    password: string
  ): Promise<{
    user: User;
    userRoleList: UserRole[];
    userPermissionList: UserPermission[];
  }> {
    try {
      const response = await this.axios.post('/api/sessions/password', {
        username: username,
        password: password,
      });
      const user = User.fromJSON(response.data.user);
      const userRoleList = response.data.user_role_list.map(UserRole.fromJSON);
      const userPermissionList = response.data.user_permission_list.map(
        UserPermission.fromJSON
      );
      return { user, userRoleList, userPermissionList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new IncorrectPasswordError();
        case HttpStatusCode.NotFound:
          throw new UsernameNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.axios.delete('/api/sessions');
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserFromSession(): Promise<{
    user: User;
    userRoleList: UserRole[];
    userPermissionList: UserPermission[];
  }> {
    try {
      const response = await this.axios.get('/api/sessions');
      const user = User.fromJSON(response.data.user);
      const userRoleList = response.data.user_role_list.map(UserRole.fromJSON);
      const userPermissionList = response.data.user_permission_list.map(
        UserPermission.fromJSON
      );
      return { user, userRoleList, userPermissionList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
