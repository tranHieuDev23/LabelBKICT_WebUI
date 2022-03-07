import { Injectable } from '@angular/core';
import {
  User,
  UserRole,
  UserListSortOrder,
  UsersService,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  constructor(private readonly userDataAccessService: UsersService) {}

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
}
