import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  InvalidImageListFilterOptionsError,
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { Export, ExportType, ImageListFilterOptions } from './schemas';

export class InvalidExportListArgument extends Error {
  constructor() {
    super('Invalid argument to retrieve export list');
  }
}

export class ExportNotFoundError extends Error {
  constructor() {
    super('Export not found');
  }
}

@Injectable({
  providedIn: 'root',
})
export class ExportsService {
  constructor(private readonly axios: Axios) {}

  public async createExport(
    type: ExportType,
    filterOptions: ImageListFilterOptions
  ): Promise<Export> {
    try {
      const response = await this.axios.post('/api/exports', {
        type: type,
        filter_options: {
          image_type_id_list: filterOptions.imageTypeIDList,
          image_tag_id_list: filterOptions.imageTagIDList,
          region_label_id_list: filterOptions.regionLabelIDList,
          uploaded_by_user_id_list: filterOptions.uploadedByUserIDList,
          published_by_user_id_list: filterOptions.publishedByUserIDList,
          verified_by_user_id_list: filterOptions.verifiedByUserIDList,
          upload_time_start: filterOptions.uploadTimeStart,
          upload_time_end: filterOptions.uploadTimeEnd,
          publish_time_start: filterOptions.publishTimeStart,
          publish_time_end: filterOptions.publishTimeEnd,
          verify_time_start: filterOptions.verifyTimeStart,
          verify_time_end: filterOptions.verifyTimeEnd,
          original_filename_query: filterOptions.originalFilenameQuery,
          image_status_list: filterOptions.imageStatusList,
          must_match_all_image_tags: filterOptions.mustMatchAllImageTags,
          must_match_all_region_labels: filterOptions.mustMatchAllRegionLabels,
          must_be_bookmarked: filterOptions.mustBeBookmarked,
          must_have_description: filterOptions.mustHaveDescription,
        },
      });
      return Export.fromJSON(response.data.export);
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

  public async getExportList(
    offset: number,
    limit: number
  ): Promise<{ totalExportCount: number; exportList: Export[] }> {
    try {
      const response = await this.axios.get('/api/exports', {
        params: { offset, limit },
      });
      const totalExportCount = response.data.total_export_count || 0;
      const exportList = response.data.export_list.map((exportJSON: any) =>
        Export.fromJSON(exportJSON)
      );
      return { totalExportCount, exportList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidExportListArgument();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deleteExport(id: number): Promise<void> {
    try {
      await this.axios.delete(`/api/exports/${id}`);
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
          throw new ExportNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getExportFile(id: number): Promise<void> {
    window.open(`/api/exports/${id}/exported-file`, 'blank');
  }
}
