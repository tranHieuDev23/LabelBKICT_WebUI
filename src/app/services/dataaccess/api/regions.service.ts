import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { ImageNotFoundError } from './images.service';
import { Polygon, Region, RegionOperationLog } from './schemas';

export class InvalidRegionInformation extends Error {
  constructor() {
    super('Invalid region information');
  }
}

export class RegionLabelCannotBeAssignedToImageError extends Error {
  constructor() {
    super('Region label cannot be assigned to image');
  }
}

export class RegionNotFoundError extends Error {
  constructor() {
    super('Region not found');
  }
}

@Injectable({
  providedIn: 'root',
})
export class RegionsService {
  constructor(private readonly axios: Axios) {}

  public async createRegion(
    imageID: number,
    border: Polygon,
    holes: Polygon[],
    regionLabelID: number
  ): Promise<Region> {
    try {
      const response = await this.axios.post(`/api/images/${imageID}/regions`, {
        border,
        holes,
        region_label_id: regionLabelID,
      });
      return Region.fromJSON(response.data.region);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidRegionInformation();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new ImageNotFoundError();
        case HttpStatusCode.Conflict:
          throw new RegionLabelCannotBeAssignedToImageError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteRegion(imageID: number, regionID: number): Promise<void> {
    try {
      await this.axios.delete(`/api/images/${imageID}/regions/${regionID}`);
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
          throw new RegionNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateRegionBoundary(
    imageID: number,
    regionID: number,
    border: Polygon,
    holes: Polygon[]
  ): Promise<Region> {
    try {
      const response = await this.axios.patch(
        `/api/images/${imageID}/regions/${regionID}/boundary`,
        {
          border,
          holes,
        }
      );
      return Region.fromJSON(response.data.region);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidRegionInformation();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new RegionNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updateRegionRegionLabel(
    imageID: number,
    regionID: number,
    regionLabelID: number
  ): Promise<Region> {
    try {
      const response = await this.axios.patch(
        `/api/images/${imageID}/regions/${regionID}/label`,
        { region_label_id: regionLabelID }
      );
      return Region.fromJSON(response.data.region);
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
          throw new RegionNotFoundError();
        case HttpStatusCode.Conflict:
          throw new RegionLabelCannotBeAssignedToImageError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getRegionOperationLogList(
    imageID: number,
    regionID: number
  ): Promise<RegionOperationLog[]> {
    try {
      const response = await this.axios.get(
        `/api/images/${imageID}/regions/${regionID}/operation-logs`
      );
      const regionOperationLogList =
        response.data.region_operation_log_list.map(
          RegionOperationLog.fromJSON
        );
      return regionOperationLogList;
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
          throw new RegionNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
