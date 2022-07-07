import { Injectable } from '@angular/core';
import {
  TagsService,
  UsersService,
  UserTag,
  UserTagListSortOrder,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class UserTagManagementService {
  constructor(
    private readonly tagsDataAccessService: TagsService,
    private readonly usersDataAccessService: UsersService
  ) {}

  public isValidDisplayName(
    permissionName: string
  ): { [k: string]: boolean } | null {
    if (permissionName.length > 256) {
      return { error: true, maxLength: true };
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

  public async createUserTag(
    displayName: string,
    description: string
  ): Promise<UserTag> {
    return await this.tagsDataAccessService.createUserTag(
      displayName.trim(),
      description.trim()
    );
  }

  public async getUserTagList(
    offset: number,
    limit: number,
    sortOrder: UserTagListSortOrder
  ): Promise<{
    totalUserTagCount: number;
    userTagList: UserTag[];
  }> {
    return await this.tagsDataAccessService.getUserTagList(
      offset,
      limit,
      sortOrder
    );
  }

  public async updateUserTag(
    id: number,
    displayName: string,
    description: string
  ): Promise<UserTag> {
    if (displayName !== undefined) displayName = displayName.trim();
    if (description !== undefined) description = description.trim();
    return await this.tagsDataAccessService.updateUserTag(
      id,
      displayName,
      description
    );
  }

  public async deleteUserTag(id: number): Promise<void> {
    return await this.tagsDataAccessService.deleteUserTag(id);
  }

  public async addUserTagToUser(
    userID: number,
    userTagID: number
  ): Promise<void> {
    await this.usersDataAccessService.addUserTagToUser(userID, userTagID);
  }

  public async removeUserTagFromUser(
    userID: number,
    userTagID: number
  ): Promise<void> {
    await this.usersDataAccessService.removeUserTagFromUser(
      userID,
      userTagID
    );
  }
}
