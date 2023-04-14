import { Injectable } from '@angular/core';
import {
  ImageListFilterOptions,
  Image,
  ImageTag,
  User,
  ImageListService,
  ImageListSortOption,
  ImagesService,
  ClassificationType,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class ImageListManagementService {
  constructor(
    private readonly imageListService: ImageListService,
    private readonly imagesService: ImagesService
  ) {}

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

  public async createImageDetectionTaskList(
    imageIDList: number[]
  ): Promise<void> {
    await this.imageListService.createImageDetectionTaskList(imageIDList);
  }

  public async createImageClassificationTaskList(
    imageIDList: number[],
    classificationType: ClassificationType
  ): Promise<void> {
    await this.imageListService.createImageClassificationTaskList(imageIDList, classificationType);
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

  public async addImageTagListToImageList(
    imageIDList: number[],
    imageTagIDList: number[]
  ): Promise<void> {
    if (imageIDList.length === 0 || imageTagIDList.length === 0) {
      return;
    }
    await this.imagesService.addImageTagListToImageList(
      imageIDList,
      imageTagIDList
    );
  }
}
