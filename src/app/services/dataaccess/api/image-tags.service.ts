import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { ImageTagGroup, ImageTag, ImageType } from './schemas';

export class InvalidImageTagGroupInformationError extends Error {
  constructor() {
    super('Invalid image tag group information');
  }
}

export class ImageTagGroupNotFoundError extends Error {
  constructor() {
    super('Cannot find image tag group');
  }
}

export class InvalidImageTagInformationError extends Error {
  constructor() {
    super('Invalid image tag information');
  }
}

export class ImageTagNotFoundError extends Error {
  constructor() {
    super('Cannot find image tag');
  }
}

export class ImageTagGroupOrImageTypeNotFoundError extends Error {
  constructor() {
    super('Cannot find image tag group or image type');
  }
}

export class ImageTagGroupAlreadyHasImageTypeError extends Error {
  constructor() {
    super('Image tag group already has image type');
  }
}

export class ImageTagGroupDoesNotHaveImageTypeError extends Error {
  constructor() {
    super('Image tag group does not have image type');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ImageTagsService {
  constructor(private readonly axios: Axios) {}

  public async createImageTagGroup(
    displayName: string,
    isSingleValue: boolean
  ): Promise<ImageTagGroup> {
    try {
      const response = await this.axios.post('/api/image-tag-groups', {
        display_name: displayName,
        is_single_value: isSingleValue,
      });
      return ImageTagGroup.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTagGroupInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getImageTagGroupList(
    withImageTag: boolean,
    withImageType: boolean
  ): Promise<{
    imageTagGroupList: ImageTagGroup[];
    imageTagList: ImageTag[][] | undefined;
    imageTypeList: ImageType[][] | undefined;
  }> {
    try {
      const response = await this.axios.get('/api/image-tag-groups', {
        params: {
          with_image_tag: withImageTag ? 1 : 0,
          with_image_type: withImageType ? 1 : 0,
        },
      });

      const imageTagGroupList = response.data.image_type_list.map(
        ImageTagGroup.fromJSON
      );

      let imageTagList: ImageTag[][] | undefined = undefined;
      if (withImageTag) {
        imageTagList = response.data.image_tag_list.map(
          (ImageTagSublist: any[]) => ImageTagSublist.map(ImageTag.fromJSON)
        );
      }

      let imageTypeList: ImageType[][] | undefined = undefined;
      if (withImageTag) {
        imageTypeList = response.data.image_type_list.map(
          (ImageTagSublist: any[]) => ImageTagSublist.map(ImageType.fromJSON)
        );
      }

      return { imageTagGroupList, imageTagList, imageTypeList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateImageTagGroup(
    id: number,
    displayName: string,
    isSingleValue: boolean
  ): Promise<ImageTagGroup> {
    try {
      const response = await this.axios.patch(`/api/image-tag-groups/${id}`, {
        display_name: displayName,
        is_single_value: isSingleValue,
      });
      return ImageTagGroup.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTagGroupInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageTagGroupNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteImageTagGroup(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/image-tag-groups/${id}`);
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
          throw new ImageTagGroupNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addImageTagToImageTagGroup(
    imageTagGroupID: number,
    displayName: string,
    color: string
  ): Promise<ImageTag> {
    try {
      const response = await this.axios.post(
        `/api/image-tag-groups/${imageTagGroupID}/tags`,
        {
          display_name: displayName,
          color: color,
        }
      );
      return ImageTag.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTagInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageTagGroupNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateImageTagOfImageTagGroup(
    imageTagGroupID: number,
    ImageTagID: number,
    displayName: string,
    color: string
  ): Promise<ImageTag> {
    try {
      const response = await this.axios.patch(
        `/api/image-tag-groups/${imageTagGroupID}/tags/${ImageTagID}`,
        {
          display_name: displayName,
          color: color,
        }
      );
      return ImageTag.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTagInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageTagNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeImageTagFromImageTagGroup(
    imageTagGroupID: number,
    ImageTagID: number
  ): Promise<void> {
    try {
      await this.axios.delete(
        `/api/image-tag-groups/${imageTagGroupID}/tags/${ImageTagID}`
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
          throw new ImageTagNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addImageTypeToImageTagGroup(
    imageTagGroupID: number,
    imageTypeID: number
  ): Promise<void> {
    try {
      await this.axios.post(
        `/api/image-tag-groups/${imageTagGroupID}/image-types`,
        {
          image_type_id: imageTypeID,
        }
      );
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTagInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageTagGroupOrImageTypeNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageTagGroupAlreadyHasImageTypeError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeImageTypeFromImageTagGroup(
    imageTagGroupID: number,
    imageTypeID: number
  ): Promise<void> {
    try {
      await this.axios.delete(
        `/api/image-tag-groups/${imageTagGroupID}/image-types/${imageTypeID}`
      );
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTagInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageTagGroupOrImageTypeNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageTagGroupDoesNotHaveImageTypeError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
