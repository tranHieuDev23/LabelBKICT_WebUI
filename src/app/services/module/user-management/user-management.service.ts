import { Injectable } from '@angular/core';
import {
  User,
  UserRole,
  UserListSortOrder,
  UsersService,
} from '../../dataaccess/api';
import { SessionManagementService } from '../session-management';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  constructor(
    private readonly userDataAccessService: UsersService,
    private readonly sessionManagementService: SessionManagementService
  ) {}

  public isValidUsername(username: string): { [k: string]: boolean } | null {
    if (0 < username.length && username.length < 6) {
      return { error: true, minLength: true };
    }
    if (username.length > 64) {
      return { error: true, maxLength: true };
    }
    if (!/^[a-zA-Z0-9]*$/.test(username)) {
      return { error: true, pattern: true };
    }
    return null;
  }

  public isValidDisplayName(
    displayName: string
  ): { [k: string]: boolean } | null {
    if (displayName.length > 256) {
      return { error: true, maxLength: true };
    }
    return null;
  }

  public async createUser(
    username: string,
    displayName: string,
    password: string
  ): Promise<User> {
    return await this.userDataAccessService.createUser(
      username.trim(),
      displayName.trim(),
      password
    );
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
    return await this.userDataAccessService.getUserList(
      offset,
      limit,
      sortOrder,
      withUserRole
    );
  }

  public async updateUser(
    id: number,
    username: string | undefined,
    displayName: string | undefined,
    password: string | undefined
  ): Promise<User> {
    if (username !== undefined) username = username.trim();
    if (displayName !== undefined) displayName = displayName.trim();

    const updatedUser = await this.userDataAccessService.updateUser(
      id,
      username,
      displayName,
      password
    );

    const sessionUserInfo =
      await this.sessionManagementService.getUserFromSession();
    if (sessionUserInfo?.user.id === id) {
      sessionUserInfo.user = updatedUser;
      this.sessionManagementService.setSessionUserInfo(sessionUserInfo);
    }

    return updatedUser;
  }
}
