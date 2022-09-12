import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { UserTag } from './schemas';

export enum UserTagListSortOrder {
  ID_ASCENDING = 0,
  ID_DESCENDING = 1,
  DISPLAY_NAME_ASCENDING = 2,
  DISPLAY_NAME_DESCENDING = 3,
}

export class InvalidUserTagInformationError extends Error {
  constructor() {
    super('Invalid user tag information');
  }
}

export class InvalidUserTagListArgument extends Error {
  constructor() {
    super('Invalid argument to retrieve user tag list');
  }
}

export class UserTagNotFoundError extends Error {
  constructor() {
    super('Cannot find user tag');
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserTagsService {
  constructor(private readonly axios: Axios) {}

  public async createUserTag(
    displayName: string,
    description: string
  ): Promise<UserTag> {
    try {
      const response = await this.axios.post('/api/user-tags', {
        display_name: displayName,
        description: description,
      });
      return UserTag.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserTagInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserTagList(
    offset: number,
    limit: number,
    sortOrder: UserTagListSortOrder
  ): Promise<{
    totalUserTagCount: number;
    userTagList: UserTag[];
  }> {
    try {
      const response = await this.axios.get('/api/user-tags', {
        params: {
          offset: offset,
          limit: limit,
          sort_order: sortOrder,
        },
      });

      const totalUserTagCount = +response.data.total_user_tag_count;
      const userTagList = response.data.user_tag_list.map(UserTag.fromJSON);

      return { totalUserTagCount, userTagList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserTagListArgument();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateUserTag(
    id: number,
    displayName: string | undefined,
    description: string | undefined
  ): Promise<UserTag> {
    try {
      const response = await this.axios.patch(`/api/user-tags/${id}`, {
        display_name: displayName,
        description: description,
      });
      return UserTag.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidUserTagInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new UserTagNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteUserTag(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/user-tags/${id}`);
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
          throw new UserTagNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
