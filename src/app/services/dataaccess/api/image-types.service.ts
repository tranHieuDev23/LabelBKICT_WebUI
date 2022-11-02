import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { ImageTag, ImageTagGroup, ImageType, RegionLabel } from './schemas';

export class InvalidImageTypeInformationError extends Error {
  constructor() {
    super('Invalid image type information');
  }
}

export class ImageTypeNotFoundError extends Error {
  constructor() {
    super('Cannot find image type');
  }
}

export class InvalidRegionLabelInformationError extends Error {
  constructor() {
    super('Invalid image type information');
  }
}

export class RegionLabelNotFoundError extends Error {
  constructor() {
    super('Cannot find region label');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ImageTypesService {
  constructor(private readonly axios: Axios) {}

  public async createImageType(
    displayName: string,
    hasPredictiveModel: boolean
  ): Promise<ImageType> {
    try {
      const response = await this.axios.post('/api/image-types', {
        display_name: displayName,
        has_predictive_model: hasPredictiveModel,
      });
      return ImageType.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTypeInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getImageTypeList(withRegionLabel: boolean): Promise<{
    imageTypeList: ImageType[];
    regionLabelList: RegionLabel[][] | undefined;
  }> {
    try {
      const response = await this.axios.get('/api/image-types', {
        params: {
          with_region_label: withRegionLabel ? 1 : 0,
        },
      });

      const imageTypeList = response.data.image_type_list.map(
        ImageType.fromJSON
      );
      let regionLabelList: RegionLabel[][] | undefined = undefined;
      if (withRegionLabel) {
        regionLabelList = response.data.region_label_list.map(
          (regionLabelSublist: any[]) =>
            regionLabelSublist.map(RegionLabel.fromJSON)
        );
      }

      return { imageTypeList, regionLabelList };
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

  public async getImageType(id: number): Promise<{
    imageType: ImageType;
    regionLabelList: RegionLabel[];
  }> {
    try {
      const response = await this.axios.get(`/api/image-types/${id}`);
      const imageType = ImageType.fromJSON(response.data.image_type);
      const regionLabelList = response.data.region_label_list.map(
        RegionLabel.fromJSON
      );
      return { imageType, regionLabelList };
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
          throw new ImageTypeNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateImageType(
    id: number,
    displayName: string,
    hasPredictiveModel: boolean
  ): Promise<ImageType> {
    try {
      const response = await this.axios.patch(`/api/image-types/${id}`, {
        display_name: displayName,
        has_predictive_model: hasPredictiveModel,
      });
      return ImageType.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidImageTypeInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageTypeNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteImageType(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/image-types/${id}`);
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
          throw new ImageTypeNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async addRegionLabelToImageType(
    imageTypeID: number,
    displayName: string,
    color: string
  ): Promise<RegionLabel> {
    try {
      const response = await this.axios.post(
        `/api/image-types/${imageTypeID}/labels`,
        {
          display_name: displayName,
          color: color,
        }
      );
      return RegionLabel.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidRegionLabelInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageTypeNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateRegionLabelOfImageType(
    imageTypeID: number,
    regionLabelID: number,
    displayName: string,
    color: string
  ): Promise<RegionLabel> {
    try {
      const response = await this.axios.patch(
        `/api/image-types/${imageTypeID}/labels/${regionLabelID}`,
        {
          display_name: displayName,
          color: color,
        }
      );
      return RegionLabel.fromJSON(response.data);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidRegionLabelInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new RegionLabelNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async removeRegionLabelFromImageType(
    imageTypeID: number,
    regionLabelID: number
  ): Promise<void> {
    try {
      await this.axios.delete(
        `/api/image-types/${imageTypeID}/labels/${regionLabelID}`
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
          throw new RegionLabelNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getImageTagGroupListOfImageType(imageTypeID: number): Promise<{
    imageTagGroupList: ImageTagGroup[];
    imageTagList: ImageTag[][];
  }> {
    try {
      const response = await this.axios.get(
        `/api/image-types/${imageTypeID}/image-tag-groups`
      );
      const imageTagGroupList = response.data.image_tag_group_list.map(
        ImageTagGroup.fromJSON
      );
      const imageTagList: ImageTag[][] = response.data.image_tag_list.map(
        (ImageTagSublist: any[]) => ImageTagSublist.map(ImageTag.fromJSON)
      );
      return { imageTagGroupList, imageTagList };
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
}
