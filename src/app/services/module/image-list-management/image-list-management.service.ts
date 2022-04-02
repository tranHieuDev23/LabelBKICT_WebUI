import { Injectable } from '@angular/core';
import {
  ImageListFilterOptions,
  Image,
  ImageTag,
  User,
  ImageListService,
  ImageListSortOption,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class ImageListManagementService {
  constructor(private readonly imageListService: ImageListService) {}

  public async updateImageListImageType(
    imageIDList: number[],
    imageTypeID: number
  ): Promise<void> {
    await this.imageListService.updateImageListImageType(
      imageIDList,
      imageTypeID
    );
  }

  public async deleteImageList(imageIDList: number[]): Promise<void> {
    await this.imageListService.deleteImageList(imageIDList);
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
    filterOptions.uploadedByUserIDList = [];
    filterOptions.originalFilenameQuery =
      filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserImageList(
      offset,
      limit,
      sortOption,
      filterOptions
    );
  }

  public async searchUserManageableImageUserList(
    query: string,
    limit: number
  ): Promise<User[]> {
    return await this.imageListService.getUserManageableImageUserList(
      query.trim(),
      limit
    );
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
    filterOptions.originalFilenameQuery =
      filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserManageableImageList(
      offset,
      limit,
      sortOption,
      filterOptions
    );
  }

  public async searchUserVerifiableImageUserList(
    query: string,
    limit: number
  ): Promise<User[]> {
    return await this.imageListService.getUserVerifiableImageUserList(
      query.trim(),
      limit
    );
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
    filterOptions.originalFilenameQuery =
      filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserVerifiableImageList(
      offset,
      limit,
      sortOption,
      filterOptions
    );
  }

  public async searchUserExportableImageUserList(
    query: string,
    limit: number
  ): Promise<User[]> {
    return await this.imageListService.getUserExportableImageUserList(
      query.trim(),
      limit
    );
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
    filterOptions.originalFilenameQuery =
      filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserExportableImageList(
      offset,
      limit,
      sortOption,
      filterOptions
    );
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
    return await this.imageListService.getImagePositionInList(
      imageID,
      sortOption,
      filterOptions
    );
  }
}
