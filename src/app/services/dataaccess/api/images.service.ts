import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { Observable } from 'rxjs';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import {
  uploadImageBatch,
  UploadImageBatchMessage,
  UploadImageBatchMessageType,
  UploadImageInput,
} from './images.helper';
import { Image, ImageBookmark, ImageStatus, ImageTag, Region } from './schemas';

export class ImageNotFoundError extends Error {
  constructor() {
    super('Cannot find image');
  }
}

export class InvalidImageInformationError extends Error {
  constructor() {
    super('Invalid image information');
  }
}

export class InvalidImageStatusError extends Error {
  constructor() {
    super('Invalid image status');
  }
}

export class ImageOrImageTypeNotFoundError extends Error {
  constructor() {
    super('Cannot find image or image type');
  }
}

export class ImageOrImageTagNotFoundError extends Error {
  constructor() {
    super('Cannot find image or image tag');
  }
}

export class ImageCannotBeAssignedWithImageTagError extends Error {
  constructor() {
    super('Image tag cannot be assigned to image');
  }
}

export class ImageAlreadyHasImageTagError extends Error {
  constructor() {
    super('Image already has image tag');
  }
}

export class ImageDoesNotHaveImageTagError extends Error {
  constructor() {
    super('Image does not have image tag');
  }
}

export class UserHasNotBookmarkedImageError extends Error {
  constructor() {
    super('User has not bookmarked the image');
  }
}

export class ImageHasUnlabeledRegionError extends Error {
  constructor() {
    super('Image has unlabeled region');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor(private readonly axios: Axios) {}

  public createImageBatch(
    inputList: UploadImageInput[]
  ): Observable<UploadImageBatchMessage> {
    return new Observable<UploadImageBatchMessage>((subscriber) => {
      if (typeof Worker !== 'undefined') {
        const worker = new Worker(
          new URL('./images.worker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.onmessage = (event: MessageEvent<UploadImageBatchMessage>) => {
          subscriber.next(event.data);
          if (event.data.type === UploadImageBatchMessageType.UPLOAD_COMPLETE) {
            subscriber.complete();
          }
        };
        worker.postMessage(inputList);
      } else {
        uploadImageBatch(inputList).subscribe(subscriber);
      }
    });
  }

  public async getImage(id: number): Promise<{
    image: Image;
    imageTagList: ImageTag[];
    regionList: Region[];
    canEdit: boolean;
  }> {
    try {
      const response = await this.axios.get(`/api/images/${id}`);
      const image = Image.fromJSON(response.data.image);
      const imageTagList = response.data.image_tag_list.map(ImageTag.fromJSON);
      const regionList = response.data.region_list.map(Region.fromJSON);
      const canEdit = response.data.can_edit || false;
      return { image, imageTagList, regionList, canEdit };
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
          throw new ImageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateImageMetadata(
    id: number,
    description: string | undefined
  ): Promise<Image> {
    try {
      const response = await this.axios.patch(`/api/images/${id}`, {
        description,
      });
      const image = Image.fromJSON(response.data.image);
      return image;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteImage(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/images/${id}`);
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
          throw new ImageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getImageRegionSnapshotList(
    id: number,
    status: ImageStatus
  ): Promise<Region[]> {
    try {
      const response = await this.axios.get(
        `/api/images/${id}/region-snapshots`,
        { params: { at_status: status } }
      );
      const regionList = response.data.region_list.map(Region.fromJSON);
      return regionList;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageStatusError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateImageImageType(
    id: number,
    imageTypeID: number
  ): Promise<Image> {
    try {
      const response = await this.axios.patch(`/api/images/${id}/image-type`, {
        image_type_id: imageTypeID,
      });
      const image = Image.fromJSON(response.data.image);
      return image;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageOrImageTypeNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateImageStatus(
    id: number,
    status: ImageStatus
  ): Promise<Image> {
    try {
      const response = await this.axios.patch(`/api/images/${id}/status`, {
        status: status,
      });
      const image = Image.fromJSON(response.data.image);
      return image;
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageStatusError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageHasUnlabeledRegionError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addImageTagToImage(
    id: number,
    imageTagID: number
  ): Promise<void> {
    try {
      await this.axios.post(`/api/images/${id}/tags`, {
        image_tag_id_list: imageTagID,
      });
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new ImageCannotBeAssignedWithImageTagError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageOrImageTagNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageAlreadyHasImageTagError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addImageTagListToImageList(
    imageIdList: number[],
    imageTagIdList: number[]
  ): Promise<void> {
    try {
      await this.axios.post(`/api/images/tags`, {
        image_id_list: imageIdList,
        image_tag_id_list: imageTagIdList
      });
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new ImageCannotBeAssignedWithImageTagError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageOrImageTagNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageAlreadyHasImageTagError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeImageTagFromImage(
    id: number,
    imageTagID: number
  ): Promise<void> {
    try {
      await this.axios.delete(`/api/images/${id}/tags/${imageTagID}`);
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
          throw new ImageOrImageTagNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageDoesNotHaveImageTagError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async createImageBookmark(
    id: number,
    description: string
  ): Promise<ImageBookmark> {
    try {
      const response = await this.axios.post(`/api/images/${id}/bookmark`, {
        description,
      });
      return ImageBookmark.fromJSON(response.data.image_bookmark);
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
          throw new ImageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getImageBookmark(id: number): Promise<ImageBookmark> {
    try {
      const response = await this.axios.get(`/api/images/${id}/bookmark`);
      return ImageBookmark.fromJSON(response.data.image_bookmark);
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
          throw new ImageNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserHasNotBookmarkedImageError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateImageBookmark(
    id: number,
    description: string | undefined
  ): Promise<ImageBookmark> {
    try {
      const response = await this.axios.patch(`/api/images/${id}/bookmark`, {
        description,
      });
      return ImageBookmark.fromJSON(response.data.image_bookmark);
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
          throw new ImageNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserHasNotBookmarkedImageError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteImageBookmark(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/images/${id}/bookmark`);
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
          throw new ImageNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserHasNotBookmarkedImageError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getDuplicatedImageIdListOfImage(id: number): Promise<number[]> {
    try {
      const response = await this.axios.get(`/api/images/${id}/duplicate-image`);
      return response.data.duplicate_image_id_list;
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
          throw new ImageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
