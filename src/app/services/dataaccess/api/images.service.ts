import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { Observable } from 'rxjs';
import { UnauthenticatedError, UnauthorizedError, UnknownAPIError } from './errors';
import {
  uploadImageBatch,
  UploadImageBatchMessage,
  UploadImageBatchMessageType,
  UploadImageInput,
} from './images.helper';
import { Image, ImageBookmark, ImageStatus, ImageTag, PointOfInterest, Region, User, Vertex } from './schemas';
import { UserAlreadyInListError, UserNotInListError } from './users.service';

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

export class ImageDoesNotHaveImageTagError extends Error {
  constructor() {
    super('Image does not have image tag');
  }
}

export class UserHasBookmarkedImageError extends Error {
  constructor() {
    super('User has bookmarked the image');
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

export class InvalidPointOfInterestInformationError extends Error {
  constructor() {
    super('Invalid point of interest information');
  }
}

export class ImageOrPointOfInterestNotFound extends Error {
  constructor() {
    super('Cannot find image or point of interest');
  }
}

export class ImageOrUserNotFoundError extends Error {
  constructor() {
    super('Cannot find image or user');
  }
}

export class UserCannotBeAddedToManageableUserListError extends Error {
  constructor() {
    super('User cannot be added to manageable user list of image');
  }
}

export class UserCannotBeAddedToVerifiableUserListError extends Error {
  constructor() {
    super('User cannot be added to verifiable user list of image');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor(private readonly axios: Axios) {}

  public createImageBatch(inputList: UploadImageInput[]): Observable<UploadImageBatchMessage> {
    return new Observable<UploadImageBatchMessage>((subscriber) => {
      if (typeof Worker !== 'undefined') {
        const worker = new Worker(new URL('./images.worker.ts', import.meta.url), { type: 'module' });
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
    pointOfInterestList: PointOfInterest[];
    regionList: Region[];
    canEdit: boolean;
    canVerify: boolean;
  }> {
    try {
      const response = await this.axios.get(`/api/images/${id}`);
      const image = Image.fromJSON(response.data.image);
      const imageTagList = response.data.image_tag_list.map(ImageTag.fromJSON);
      const regionList = response.data.region_list.map(Region.fromJSON);
      const pointOfInterestList = response.data.point_of_interest_list.map(PointOfInterest.fromJSON);
      const canEdit = response.data.can_edit || false;
      const canVerify = response.data.can_verify || false;
      return { image, imageTagList, regionList, pointOfInterestList, canEdit, canVerify };
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

  public async updateImageMetadata(id: number, description: string | undefined): Promise<Image> {
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

  public async getImageRegionSnapshotList(id: number, status: ImageStatus): Promise<Region[]> {
    try {
      const response = await this.axios.get(`/api/images/${id}/region-snapshots`, { params: { at_status: status } });
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

  public async updateImageImageType(id: number, imageTypeID: number): Promise<Image> {
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

  public async updateImageStatus(id: number, status: ImageStatus): Promise<Image> {
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

  public async addImageTagToImage(id: number, imageTagID: number): Promise<void> {
    try {
      await this.axios.post(`/api/images/${id}/tags`, {
        image_tag_id: imageTagID,
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
          throw new ImageOrImageTagNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageCannotBeAssignedWithImageTagError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addImageTagListToImageList(imageIdList: number[], imageTagIdList: number[]): Promise<void> {
    try {
      await this.axios.post(`/api/images/tags`, {
        image_id_list: imageIdList,
        image_tag_id_list: imageTagIdList,
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
          throw new ImageOrImageTagNotFoundError();
        case HttpStatusCode.Conflict:
          throw new ImageCannotBeAssignedWithImageTagError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeImageTagFromImage(id: number, imageTagID: number): Promise<void> {
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

  public async createImageBookmark(id: number, description: string): Promise<ImageBookmark> {
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
        case HttpStatusCode.Conflict:
          throw new UserHasBookmarkedImageError();
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

  public async updateImageBookmark(id: number, description: string | undefined): Promise<ImageBookmark> {
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

  public async addPointOfInterestToImage(
    imageId: number,
    coordinate: Vertex,
    description: string
  ): Promise<PointOfInterest> {
    try {
      const response = await this.axios.post(`/api/images/${imageId}/pois`, {
        coordinate,
        description,
      });
      return PointOfInterest.fromJSON(response.data.point_of_interest || undefined);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidPointOfInterestInformationError();
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

  public async updatePointOfInterestOfImage(
    imageId: number,
    poiId: number,
    coordinate: Vertex,
    description: string
  ): Promise<PointOfInterest> {
    try {
      const response = await this.axios.patch(`/api/images/${imageId}/pois/${poiId}`, {
        coordinate,
        description,
      });
      return PointOfInterest.fromJSON(response.data.point_of_interest || undefined);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidPointOfInterestInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageOrPointOfInterestNotFound();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deletePointOfInterestOfImage(imageId: number, poiId: number): Promise<void> {
    try {
      await this.axios.delete(`/api/images/${imageId}/pois/${poiId}`);
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
          throw new ImageOrPointOfInterestNotFound();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getManageableUsersOfImage(
    imageId: number,
    offset: number,
    limit: number
  ): Promise<{
    totalUserCount: number;
    userList: { user: User; canEdit: boolean }[];
  }> {
    try {
      const response = await this.axios.get(`/api/images/${imageId}/manageable-users`, {
        params: { offset, limit },
      });

      const totalUserCount = +response.data.total_user_count;
      const userList = response.data.user_list.map((item: any) => {
        return {
          user: User.fromJSON(item.user),
          canEdit: item.can_edit || false,
        };
      });
      return { totalUserCount, userList };
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

  public async addManageableUserToImage(
    imageId: number,
    userId: number,
    canEdit: boolean
  ): Promise<{ user: User; canEdit: boolean }> {
    try {
      const response = await this.axios.post(`/api/images/${imageId}/manageable-users`, {
        user_id: userId,
        can_edit: canEdit,
      });
      return {
        user: User.fromJSON(response.data.user),
        canEdit: response.data.can_edit || false,
      };
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
          throw new UserAlreadyInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateManageableUserOfImage(
    imageId: number,
    userId: number,
    canEdit: boolean
  ): Promise<{ user: User; canEdit: boolean }> {
    try {
      const response = await this.axios.patch(`/api/images/${imageId}/manageable-users/${userId}`, {
        can_edit: canEdit,
      });
      return {
        user: User.fromJSON(response.data.user),
        canEdit: response.data.can_edit || false,
      };
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

  public async removeManageableUserOfImage(imageId: number, userId: number): Promise<void> {
    try {
      await this.axios.delete(`/api/images/${imageId}/manageable-users/${userId}`);
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
          throw new UserNotInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getVerifiableUsersOfImage(
    imageId: number,
    offset: number,
    limit: number
  ): Promise<{
    totalUserCount: number;
    userList: User[];
  }> {
    try {
      const response = await this.axios.get(`/api/images/${imageId}/verifiable-users`, {
        params: { offset, limit },
      });
      const totalUserCount = +response.data.total_user_count;
      const userList = response.data.user_list.map((item: any) => User.fromJSON(item.user));
      return { totalUserCount, userList };
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

  public async addVerifiableUserToImage(imageId: number, userId: number): Promise<User> {
    try {
      const response = await this.axios.post(`/api/images/${imageId}/verifiable-users`, {
        user_id: userId,
      });
      return User.fromJSON(response.data.user);
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
          throw new UserAlreadyInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeVerifiableUserOfImage(imageId: number, userId: number): Promise<void> {
    try {
      await this.axios.delete(`/api/images/${imageId}/verifiable-users/${userId}`);
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
          throw new UserNotInListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async createUserListCanManageImageList(
    userIdList: number[],
    imageIdList: number[],
    canEdit: boolean
  ): Promise<void> {
    try {
      await this.axios.post(`/api/images/manageable-users`, {
        image_id_list: imageIdList,
        user_id_list: userIdList,
        can_edit: canEdit,
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
          throw new ImageOrUserNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserCannotBeAddedToManageableUserListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async createUserListCanVerifyImageList(userIdList: number[], imageIdList: number[]): Promise<void> {
    try {
      await this.axios.post(`/api/images/verifiable-users`, {
        image_id_list: imageIdList,
        user_id_list: userIdList,
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
          throw new ImageOrUserNotFoundError();
        case HttpStatusCode.Conflict:
          throw new UserCannotBeAddedToVerifiableUserListError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
