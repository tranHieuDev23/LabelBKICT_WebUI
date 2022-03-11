import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { User, UserRole } from './schemas';

export enum UserListSortOrder {
  ID_ASCENDING = 0,
  ID_DESCENDING = 1,
  USERNAME_ASCENDING = 2,
  USERNAME_DESCENDING = 3,
  DISPLAY_NAME_ASCENDING = 4,
  DISPLAY_NAME_DESCENDING = 5,
}

export class InvalidUserInformationError extends Error {
  constructor() {
    super('Invalid user information');
  }
}

export class UsernameTakenError extends Error {
  constructor() {
    super('Username has already been taken');
  }
}

export class InvalidUserListArgument extends Error {
  constructor() {
    super('Invalid argument to retrieve user list');
  }
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private readonly axios: Axios) {}

  public async createUser(
    username: string,
    displayName: string,
    password: string
  ): Promise<User> {
    try {
      const response = await this.axios.post('/api/users', {
        username: username,
        display_name: displayName,
        password: password,
      });
      return User.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserInformationError();
        case HttpStatusCode.Conflict:
          throw new UsernameTakenError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserList(
    offset: number,
    limit: number,
    sortOrder: UserListSortOrder,
    withUserRole: boolean
  ): Promise<{
    totalUserCount: number;
    userList: User[];
    userRoleList: UserRole[][] | undefined;
  }> {
    try {
      const response = await this.axios.get('/api/users', {
        params: {
          offset: offset,
          limit: limit,
          sort_order: sortOrder,
          with_user_role: withUserRole ? 1 : 0,
        },
      });

      const totalUserCount = +response.data.total_user_count;
      const userList = response.data.user_list.map(User.fromJSON);
      if (!withUserRole) {
        return { totalUserCount, userList, userRoleList: undefined };
      }

      const userRoleJSONList = response.data.user_role_list as any[];
      const userRoleList = userRoleJSONList.map((list) =>
        list.map(UserRole.fromJSON)
      );
      return { totalUserCount, userList, userRoleList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserListArgument();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateUser(
    id: number,
    username: string | undefined,
    displayName: string | undefined,
    password: string | undefined
  ): Promise<User> {
    try {
      const response = await this.axios.patch(`/api/users/${id}`, {
        username: username,
        display_name: displayName,
        password: password,
      });
      return User.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.Conflict:
          throw new UsernameTakenError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addUserRoleToUser(
    userID: number,
    userRoleID: number
  ): Promise<void> {
    try {
      await this.axios.post(`/api/users/${userID}/roles`, {
        user_role_id: userRoleID,
      });
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.Conflict:
          throw new UsernameTakenError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeUserRoleFromUser(
    userID: number,
    userRoleID: number
  ): Promise<void> {
    try {
      await this.axios.delete(`/api/users/${userID}/roles/${userRoleID}`);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.Conflict:
          throw new UsernameTakenError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
