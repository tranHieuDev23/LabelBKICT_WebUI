import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import qs from 'qs';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import {
  Image,
  ImageListFilterOptions,
  ImageListSortOption,
  ImageTag,
  User,
} from './schemas';

export class TooManyImagesError extends Error {
  constructor() {
    super('Too many images to process');
  }
}

export class OneOrMoreImagesNotFoundError extends Error {
  constructor() {
    super('One or more images cannot be found');
  }
}

export class InvalidImageListFilterOptionsError extends Error {
  constructor() {
    super('Invalid image list filter options');
  }
}

export class ImageUserSearchArgumentsError extends Error {
  constructor() {
    super('Invalid user search arguments');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ImageListService {
  constructor(private readonly axios: Axios) {}

  public async updateImageListImageType(
    imageIDList: number[],
    imageTypeID: number
  ): Promise<void> {
    try {
      await this.axios.patch('/api/images', {
        image_id_list: imageIDList,
        image_type_id: imageTypeID,
      });
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new TooManyImagesError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new OneOrMoreImagesNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteImageList(imageIDList: number[]): Promise<void> {
    try {
      await this.axios.delete('/api/images', {
        data: {
          image_id_list: imageIDList,
        },
      });
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new TooManyImagesError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new OneOrMoreImagesNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserImageList(
    offset: number,
    limit: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    totalImageCount: number;
    imageList: Image[];
    imageTagList: ImageTag[][];
  }> {
    try {
      const filterOptionsQueryParams =
        this.getQueryParamsFromFilterOptions(filterOptions);
      const response = await this.axios.get('/api/sessions/user/images', {
        params: {
          offset: offset,
          limit: limit,
          sort_order: sortOption,
          ...filterOptionsQueryParams,
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: 'repeat' });
        },
      });

      const totalImageCount = +response.data.total_image_count;
      const imageList = response.data.image_list.map(Image.fromJSON);
      const imageTagList = (response.data.image_tag_list || []).map(
        (imageTagSublist: any[]) => imageTagSublist.map(ImageTag.fromJSON)
      );

      return { totalImageCount, imageList, imageTagList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageListFilterOptionsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserManageableImageUserList(
    query: string,
    limit: number
  ): Promise<User[]> {
    try {
      const response = await this.axios.get(
        '/api/sessions/user/manageable-image-users',
        { params: { query: query, limit: limit } }
      );

      const userList = response.data.user_list.map(User.fromJSON);
      return userList;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new ImageUserSearchArgumentsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserManageableImageList(
    offset: number,
    limit: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    totalImageCount: number;
    imageList: Image[];
    imageTagList: ImageTag[][];
  }> {
    try {
      const filterOptionsQueryParams =
        this.getQueryParamsFromFilterOptions(filterOptions);
      const response = await this.axios.get(
        '/api/sessions/user/manageable-images',
        {
          params: {
            offset: offset,
            limit: limit,
            sort_order: sortOption,
            ...filterOptionsQueryParams,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
          },
        }
      );

      const totalImageCount = +response.data.total_image_count;
      const imageList = response.data.image_list.map(Image.fromJSON);
      const imageTagList = (response.data.image_tag_list || []).map(
        (imageTagSublist: any[]) => imageTagSublist.map(ImageTag.fromJSON)
      );

      return { totalImageCount, imageList, imageTagList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageListFilterOptionsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserVerifiableImageUserList(
    query: string,
    limit: number
  ): Promise<User[]> {
    try {
      const response = await this.axios.get(
        '/api/sessions/user/verifiable-image-users',
        { params: { query: query, limit: limit } }
      );

      const userList = response.data.user_list.map(User.fromJSON);
      return userList;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new ImageUserSearchArgumentsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserVerifiableImageList(
    offset: number,
    limit: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    totalImageCount: number;
    imageList: Image[];
    imageTagList: ImageTag[][];
  }> {
    try {
      const filterOptionsQueryParams =
        this.getQueryParamsFromFilterOptions(filterOptions);
      const response = await this.axios.get(
        '/api/sessions/user/verifiable-images',
        {
          params: {
            offset: offset,
            limit: limit,
            sort_order: sortOption,
            ...filterOptionsQueryParams,
          },
        }
      );

      const totalImageCount = +response.data.total_image_count;
      const imageList = response.data.image_list.map(Image.fromJSON);
      const imageTagList = (response.data.image_tag_list || []).map(
        (imageTagSublist: any[]) => imageTagSublist.map(ImageTag.fromJSON)
      );

      return { totalImageCount, imageList, imageTagList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageListFilterOptionsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserExportableImageUserList(
    query: string,
    limit: number
  ): Promise<User[]> {
    try {
      const response = await this.axios.get(
        '/api/sessions/user/exportable-image-users',
        { params: { query: query, limit: limit } }
      );

      const userList = response.data.user_list.map(User.fromJSON);
      return userList;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new ImageUserSearchArgumentsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getUserExportableImageList(
    offset: number,
    limit: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    totalImageCount: number;
    imageList: Image[];
    imageTagList: ImageTag[][];
  }> {
    try {
      const filterOptionsQueryParams =
        this.getQueryParamsFromFilterOptions(filterOptions);
      const response = await this.axios.get(
        '/api/sessions/user/exportable-images',
        {
          params: {
            offset: offset,
            limit: limit,
            sort_order: sortOption,
            ...filterOptionsQueryParams,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
          },
        }
      );

      const totalImageCount = +response.data.total_image_count;
      const imageList = response.data.image_list.map(Image.fromJSON);
      const imageTagList = (response.data.image_tag_list || []).map(
        (imageTagSublist: any[]) => imageTagSublist.map(ImageTag.fromJSON)
      );

      return { totalImageCount, imageList, imageTagList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageListFilterOptionsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getImagePositionInList(
    imageID: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    position: number;
    totalImageCount: number;
    prevImageID: number | undefined;
    nextImageID: number | undefined;
  }> {
    try {
      const filterOptionsQueryParams =
        this.getQueryParamsFromFilterOptions(filterOptions);
      const response = await this.axios.get(`/api/images/${imageID}/position`, {
        params: {
          sort_order: sortOption,
          ...filterOptionsQueryParams,
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: 'repeat' });
        },
      });

      const position = +response.data.position;
      const totalImageCount = +response.data.total_image_count;
      const prevImageID = response.data.prev_image_id;
      const nextImageID = response.data.next_image_id;
      return { position, totalImageCount, prevImageID, nextImageID };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageListFilterOptionsError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  private getQueryParamsFromFilterOptions(
    filterOptions: ImageListFilterOptions
  ): any {
    return {
      filter_image_types: filterOptions.imageTypeIDList,
      filter_image_tags: filterOptions.imageTagIDList,
      filter_region_labels: filterOptions.regionLabelIDList,
      filter_uploaded_by_user_ids: filterOptions.uploadedByUserIDList,
      filter_published_by_user_ids: filterOptions.publishedByUserIDList,
      filter_verified_by_user_ids: filterOptions.verifiedByUserIDList,
      filter_upload_time_start: filterOptions.uploadTimeStart,
      filter_upload_time_end: filterOptions.uploadTimeEnd,
      filter_publish_time_start: filterOptions.publishTimeStart,
      filter_publish_time_end: filterOptions.publishTimeEnd,
      filter_verify_time_start: filterOptions.verifyTimeStart,
      filter_verify_time_end: filterOptions.verifyTimeEnd,
      original_file_name_query: filterOptions.originalFilenameQuery,
      filter_image_statuses: filterOptions.imageStatusList,
      must_match_all_image_tags: filterOptions.mustMatchAllImageTags ? 1 : 0,
      must_match_all_region_labels: filterOptions.mustMatchAllRegionLabels
        ? 1
        : 0,
    };
  }
}
