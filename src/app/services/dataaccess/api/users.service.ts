import { Injectable } from '@angular/core';
import { Axios } from 'axios';
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
    throw new Error('not implemented');
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
    throw new Error('not implemented');
  }

  public async updateUser(
    id: number,
    username: string | undefined,
    displayName: string | undefined,
    password: string | undefined
  ): Promise<User> {
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
