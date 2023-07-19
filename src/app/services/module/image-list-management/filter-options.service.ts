import { Injectable } from '@angular/core';
import { ImageListFilterOptions, ImageListFilterOptionsWithMetadata } from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class FilterOptionsService {
  public getFilterOptionsFromFilterOptionsWithMetadata(
    filterOptionsWithMetadata: ImageListFilterOptionsWithMetadata
  ): ImageListFilterOptions {
    const filterOptions = new ImageListFilterOptions();
    filterOptions.imageTypeIDList = filterOptionsWithMetadata.imageTypeList.map((imageType) => imageType?.id || 0);
    filterOptions.imageTagIDList = filterOptionsWithMetadata.imageTagList.map((imageTag) => imageTag.id);
    filterOptions.regionLabelIDList = filterOptionsWithMetadata.regionLabelList.map((regionLabel) => regionLabel.id);
    filterOptions.uploadedByUserIDList = filterOptionsWithMetadata.uploadedByUserList.map((user) => user.id);
    filterOptions.publishedByUserIDList = filterOptionsWithMetadata.publishedByUserList.map((user) => user.id);
    filterOptions.verifiedByUserIDList = filterOptionsWithMetadata.verifiedByUserList.map((user) => user.id);
    filterOptions.uploadTimeStart = filterOptionsWithMetadata.uploadTimeStart;
    filterOptions.uploadTimeEnd = filterOptionsWithMetadata.uploadTimeEnd;
    filterOptions.publishTimeStart = filterOptionsWithMetadata.publishTimeStart;
    filterOptions.publishTimeEnd = filterOptionsWithMetadata.publishTimeEnd;
    filterOptions.verifyTimeStart = filterOptionsWithMetadata.verifyTimeStart;
    filterOptions.verifyTimeEnd = filterOptionsWithMetadata.verifyTimeEnd;
    filterOptions.imageStatusList = filterOptionsWithMetadata.imageStatusList;
    filterOptions.originalFilenameQuery = filterOptionsWithMetadata.originalFilenameQuery;
    filterOptions.mustMatchAllImageTags = filterOptionsWithMetadata.mustMatchAllImageTags;
    filterOptions.mustMatchAllRegionLabels = filterOptionsWithMetadata.mustMatchAllRegionLabels;
    filterOptions.mustBeBookmarked = filterOptionsWithMetadata.mustBeBookmarked;
    filterOptions.mustHaveDescription = filterOptionsWithMetadata.mustHaveDescription;
    return filterOptions;
  }
}
