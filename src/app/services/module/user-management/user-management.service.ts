import { Injectable } from '@angular/core';
import {
  User,
  UserRole,
  UserListSortOrder,
  UsersService,
  UserCanVerifyUserImage,
  UserCanManageUserImage,
  UserListFilterOptions,
  UserTag,
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

  public isValidDisplayName(displayName: string): { [k: string]: boolean } | null {
    if (displayName.length > 256) {
      return { error: true, maxLength: true };
    }
    return null;
  }

  public async createUser(username: string, displayName: string, password: string): Promise<User> {
    return await this.userDataAccessService.createUser(username.trim(), displayName.trim(), password);
  }

  public async getUserList(
    offset: number,
    limit: number,
    sortOrder: UserListSortOrder,
    withUserRole: boolean,
    withUserTag: boolean,
    filterOptions: UserListFilterOptions
  ): Promise<{
    totalUserCount: number;
    userList: User[];
    userRoleList: UserRole[][] | undefined;
    userTagList: UserTag[][] | undefined;
  }> {
    filterOptions.usernameQuery = filterOptions.usernameQuery.trim();
    return await this.userDataAccessService.getUserList(
      offset,
      limit,
      sortOrder,
      withUserRole,
      withUserTag,
      filterOptions
    );
  }

  public async searchUserList(query: string, limit: number): Promise<User[]> {
    return await this.userDataAccessService.searchUserList(query.trim(), limit);
  }

  public async updateUser(
    id: number,
    username: string | undefined,
    displayName: string | undefined,
    password: string | undefined
  ): Promise<User> {
    if (username !== undefined) username = username.trim();
    if (displayName !== undefined) displayName = displayName.trim();

    const updatedUser = await this.userDataAccessService.updateUser(id, username, displayName, password);

    const sessionUserInfo = await this.sessionManagementService.getUserFromSession();
    if (sessionUserInfo?.user.id === id) {
      sessionUserInfo.user = updatedUser;
      this.sessionManagementService.setSessionUserInfo(sessionUserInfo);
    }

    return updatedUser;
  }

  public async createUserCanManageUserImage(
    userID: number,
    imageOfUserID: number,
    canEdit: boolean
  ): Promise<UserCanManageUserImage> {
    return await this.userDataAccessService.createUserCanManageUserImage(userID, imageOfUserID, canEdit);
  }

  public async getUserCanManageUserImageListOfUser(
    userID: number,
    offset: number,
    limit: number
  ): Promise<{ totalUserCount: number; userList: UserCanManageUserImage[] }> {
    return await this.userDataAccessService.getUserCanManageUserImageListOfUser(userID, offset, limit);
  }

  public async updateUserCanManageUserImage(
    userID: number,
    imageOfUserID: number,
    canEdit: boolean | undefined
  ): Promise<UserCanManageUserImage> {
    return await this.userDataAccessService.updateUserCanManageUserImage(userID, imageOfUserID, canEdit);
  }

  public async deleteUserCanManageUserImage(userID: number, imageOfUserID: number): Promise<void> {
    await this.userDataAccessService.deleteUserCanManageUserImage(userID, imageOfUserID);
  }

  public async createUserCanVerifyUserImage(userID: number, imageOfUserID: number): Promise<UserCanVerifyUserImage> {
    return await this.userDataAccessService.createUserCanVerifyUserImage(userID, imageOfUserID);
  }

  public async getUserCanVerifyUserImageListOfUser(
    userID: number,
    offset: number,
    limit: number
  ): Promise<{ totalUserCount: number; userList: UserCanVerifyUserImage[] }> {
    return await this.userDataAccessService.getUserCanVerifyUserImageListOfUser(userID, offset, limit);
  }

  public async deleteUserCanVerifyUserImage(userID: number, imageOfUserID: number): Promise<void> {
    await this.userDataAccessService.deleteUserCanVerifyUserImage(userID, imageOfUserID);
  }
}
