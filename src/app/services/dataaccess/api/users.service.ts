import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import {
  User,
  UserCanManageUserImage,
  UserCanVerifyUserImage,
  UserListFilterOptions,
  UserRole,
  UserTag,
} from './schemas';

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

export class InvalidUserListArgumentError extends Error {
  constructor() {
    super('Invalid argument to retrieve user list');
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('Cannot find user');
  }
}

export class UserOrUserRoleNotFoundError extends Error {
  constructor() {
    super('Cannot find user or user role');
  }
}


export class UserAlreadyHasUserRoleError extends Error {
  constructor() {
    super('User already has user role');
  }
}

export class UserDoesNotHaveUserRoleError extends Error {
  constructor() {
    super('User does not have user role');
  }
}

export class UserOrUserTagNotFoundError extends Error {
  constructor() {
    super('Cannot find user or user tag');
  }
}

export class UserAlreadyHasUserTagError extends Error {
  constructor() {
    super('User already has user tag');
  }
}

export class UserDoesNotHaveUserTagError extends Error {
  constructor() {
    super('User does not have user tag');
  }
}

export class UserSearchArgumentsError extends Error {
  constructor() {
    super('Invalid user search arguments');
  }
}

export class SameUserError extends Error {
  constructor() {
    super('Cannot assign to the same user');
  }
}

export class UserAlreadyInListError extends Error {
  constructor() {
    super('User is already in user list');
  }
}

export class UserNotInListError extends Error {
  constructor() {
    super('User is not in user list');
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
    withUserRole: boolean,
    filterOptions: UserListFilterOptions
  ): Promise<{
    totalUserCount: number;
    userList: User[];
    userRoleList: UserRole[][] | undefined;
    userTagList: UserTag[][];
  }> {
    try {
      const filterOptionsQueryParams =
        this.getQueryParamsFromFilterOptions(filterOptions);
      const response = await this.axios.get('/api/users', {
        params: {
          offset: offset,
          limit: limit,
          sort_order: sortOrder,
          with_user_role: withUserRole ? 1 : 0,
          ...filterOptionsQueryParams
        },
      });

      const totalUserCount = +response.data.total_user_count;
      const userList = response.data.user_list.map(User.fromJSON);
      const userTagJSONList = response.data.user_tag_list as any[];
      const userTagList = userTagJSONList.map((list) =>
        list.map(UserTag.fromJSON)
      );
      if (!withUserRole) {
        return { totalUserCount, userList, userRoleList: undefined, userTagList };
      }

      const userRoleJSONList = response.data.user_role_list as any[];
      const userRoleList = userRoleJSONList.map((list) =>
        list.map(UserRole.fromJSON)
      );
      return { totalUserCount, userList, userRoleList, userTagList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserListArgumentError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async searchUserList(query: string, limit: number): Promise<User[]> {
    try {
      const response = await this.axios.get('/api/users/search', {
        params: { query: query, limit: limit },
      });
      const userList = response.data.user_list.map(User.fromJSON);
      return userList;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new UserSearchArgumentsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
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
        case HttpStatusCode.NotFound:
          throw new UserNotFoundError();
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
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserOrUserRoleNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserAlreadyHasUserRoleError();
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
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserOrUserRoleNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserDoesNotHaveUserRoleError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addUserTagToUser(
    userID: number,
    userTagID: number
  ): Promise<void> {
    try {
      await this.axios.post(`/api/users/${userID}/tags`, {
        user_tag_id: userTagID,
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
          throw new UserOrUserTagNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserAlreadyHasUserTagError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeUserTagFromUser(
    userID: number,
    userTagID: number
  ): Promise<void> {
    try {
      await this.axios.delete(`/api/users/${userID}/tags/${userTagID}`);
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
          throw new UserOrUserTagNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserDoesNotHaveUserTagError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async createUserCanManageUserImage(
    userID: number,
    imageOfUserID: number,
    canEdit: boolean
  ): Promise<UserCanManageUserImage> {
    try {
      const response = await this.axios.post(
        `/api/users/${userID}/manageable-image-users`,
        { image_of_user_id: imageOfUserID, can_edit: canEdit }
      );
      return UserCanManageUserImage.fromJSON(
        response.data.user_can_manage_user_image
      );
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new SameUserError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserAlreadyInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserCanManageUserImageListOfUser(
    userID: number,
    offset: number,
    limit: number
  ): Promise<{ totalUserCount: number; userList: UserCanManageUserImage[] }> {
    try {
      const response = await this.axios.get(
        `/api/users/${userID}/manageable-image-users`,
        { params: { offset, limit } }
      );
      const totalUserCount = +response.data.total_user_count;
      const userList = response.data.user_list.map(
        UserCanManageUserImage.fromJSON
      );
      return { totalUserCount, userList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserListArgumentError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateUserCanManageUserImage(
    userID: number,
    imageOfUserID: number,
    canEdit: boolean | undefined
  ): Promise<UserCanManageUserImage> {
    try {
      const response = await this.axios.patch(
        `/api/users/${userID}/manageable-image-users/${imageOfUserID}`,
        { can_edit: canEdit }
      );
      return UserCanManageUserImage.fromJSON(
        response.data.user_can_manage_user_image
      );
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
          throw new UserNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserNotInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteUserCanManageUserImage(
    userID: number,
    imageOfUserID: number
  ): Promise<void> {
    try {
      await this.axios.delete(
        `/api/users/${userID}/manageable-image-users/${imageOfUserID}`
      );
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
          throw new UserNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserNotInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async createUserCanVerifyUserImage(
    userID: number,
    imageOfUserID: number
  ): Promise<UserCanVerifyUserImage> {
    try {
      const response = await this.axios.post(
        `/api/users/${userID}/verifiable-image-users`,
        { image_of_user_id: imageOfUserID }
      );
      return UserCanVerifyUserImage.fromJSON(
        response.data.user_can_verify_user_image
      );
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new SameUserError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserAlreadyInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserCanVerifyUserImageListOfUser(
    userID: number,
    offset: number,
    limit: number
  ): Promise<{ totalUserCount: number; userList: UserCanVerifyUserImage[] }> {
    try {
      const response = await this.axios.get(
        `/api/users/${userID}/verifiable-image-users`,
        { params: { offset, limit } }
      );
      const totalUserCount = +response.data.total_user_count;
      const userList = response.data.user_list.map(
        UserCanVerifyUserImage.fromJSON
      );
      return { totalUserCount, userList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserListArgumentError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteUserCanVerifyUserImage(
    userID: number,
    imageOfUserID: number
  ): Promise<void> {
    try {
      await this.axios.delete(
        `/api/users/${userID}/verifiable-image-users/${imageOfUserID}`
      );
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
          throw new UserNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserNotInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  private getQueryParamsFromFilterOptions(
    filterOptions: UserListFilterOptions
  ): any {
    return {
      username_query: filterOptions.userNameQuery,
      filter_user_tags: filterOptions.userTagList,
      filter_user_roles: filterOptions.userRoleList
    };
  }
}
