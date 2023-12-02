import { Injectable } from '@angular/core';
import {
  ImageListFilterOptions,
  Image,
  ImageTag,
  User,
  ImageListService,
  ImageListSortOption,
  ImagesService,
  DetectionTaskListSortOption,
  DetectionTask,
  UserHasBookmarkedImageError,
  UserHasNotBookmarkedImageError,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class ImageListManagementService {
  constructor(private readonly imageListService: ImageListService, private readonly imagesService: ImagesService) {}

  public async updateImageListImageType(imageIdList: number[], imageTypeID: number): Promise<void> {
    await this.imageListService.updateImageListImageType(imageIdList, imageTypeID);
  }

  public async deleteImageList(imageIdList: number[]): Promise<void> {
    await this.imageListService.deleteImageList(imageIdList);
  }

  public async getImageDetectionTaskList(
    offset: number,
    limit: number,
    sortOption: DetectionTaskListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    totalDetectionTaskCount: number;
    detectionTaskList: DetectionTask[];
  }> {
    return this.imageListService.getImageDetectionTaskList(offset, limit, sortOption, filterOptions);
  }

  public async createImageDetectionTaskList(imageIdList: number[]): Promise<void> {
    await this.imageListService.createImageDetectionTaskList(imageIdList);
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
    bookmarkedImageIdList: number[];
  }> {
    filterOptions.uploadedByUserIDList = [];
    filterOptions.originalFilenameQuery = filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserImageList(offset, limit, sortOption, filterOptions);
  }

  public async searchUserManageableImageUserList(query: string, limit: number): Promise<User[]> {
    return await this.imageListService.getUserManageableImageUserList(query.trim(), limit);
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
    bookmarkedImageIdList: number[];
  }> {
    filterOptions.originalFilenameQuery = filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserManageableImageList(offset, limit, sortOption, filterOptions);
  }

  public async searchUserVerifiableImageUserList(query: string, limit: number): Promise<User[]> {
    return await this.imageListService.getUserVerifiableImageUserList(query.trim(), limit);
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
    bookmarkedImageIdList: number[];
  }> {
    filterOptions.originalFilenameQuery = filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserVerifiableImageList(offset, limit, sortOption, filterOptions);
  }

  public async searchUserExportableImageUserList(query: string, limit: number): Promise<User[]> {
    return await this.imageListService.getUserExportableImageUserList(query.trim(), limit);
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
    bookmarkedImageIdList: number[];
  }> {
    filterOptions.originalFilenameQuery = filterOptions.originalFilenameQuery.trim();
    return await this.imageListService.getUserExportableImageList(offset, limit, sortOption, filterOptions);
  }

  public async getImagePositionInUserManageableImageList(
    imageId: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    position: number;
    totalImageCount: number;
    prevImageId: number | undefined;
    nextImageId: number | undefined;
  }> {
    return await this.imageListService.getImagePositionInUserManageableImageList(imageId, sortOption, filterOptions);
  }

  public async getImagePositionInUserVerifiableImageList(
    imageID: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<{
    position: number;
    totalImageCount: number;
    prevImageId: number | undefined;
    nextImageId: number | undefined;
  }> {
    return await this.imageListService.getImagePositionInUserVerifiableImageList(imageID, sortOption, filterOptions);
  }

  public async addImageTagListToImageList(imageIdList: number[], imageTagIdList: number[]): Promise<void> {
    if (imageIdList.length === 0 || imageTagIdList.length === 0) {
      return;
    }
    await this.imagesService.addImageTagListToImageList(imageIdList, imageTagIdList);
  }

  public async createEmptyBookmarkForImageList(idList: number[]): Promise<void> {
    await Promise.all(
      idList.map(async (id) => {
        try {
          this.imagesService.createImageBookmark(id, '');
        } catch (error) {
          if (error instanceof UserHasBookmarkedImageError) {
            return;
          }

          throw error;
        }
      })
    );
  }

  public async deleteBookmarkOfImageList(idList: number[]): Promise<void> {
    await Promise.all(
      idList.map(async (id) => {
        try {
          this.imagesService.deleteImageBookmark(id);
        } catch (error) {
          if (error instanceof UserHasNotBookmarkedImageError) {
            return;
          }

          throw error;
        }
      })
    );
  }

  public async createUserListCanManageImageList(
    userIdList: number[],
    imageIdList: number[],
    canEdit: boolean
  ): Promise<void> {
    this.imagesService.createUserListCanManageImageList(userIdList, imageIdList, canEdit);
  }

  public async createUserListCanVerifyImageList(userIdList: number[], imageIdList: number[]): Promise<void> {
    this.imagesService.createUserListCanVerifyImageList(userIdList, imageIdList);
  }
}
