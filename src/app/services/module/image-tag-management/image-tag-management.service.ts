import { Injectable } from '@angular/core';
import {
  ImageTag,
  ImageTagGroup,
  ImageTagsService,
  ImageType,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class ImageTagManagementService {
  constructor(private readonly imageTagGroupsService: ImageTagsService) {}

  public async createImageTagGroup(
    displayName: string,
    isSingleValue: boolean
  ): Promise<ImageTagGroup> {
    return await this.imageTagGroupsService.createImageTagGroup(
      displayName.trim(),
      isSingleValue
    );
  }

  public async getImageTagGroupList(): Promise<{
    imageTagGroupList: ImageTagGroup[];
    imageTagList: ImageTag[][];
    imageTypeList: ImageType[][];
  }> {
    const { imageTagGroupList, imageTagList, imageTypeList } =
      await this.imageTagGroupsService.getImageTagGroupList(true, true);
    if (imageTagList === undefined) {
      throw new Error('Invalid image tag list response from API');
    }
    if (imageTypeList === undefined) {
      throw new Error('Invalid image type list response from API');
    }
    return {
      imageTagGroupList,
      imageTagList,
      imageTypeList,
    };
  }

  public async updateImageTagGroup(
    id: number,
    displayName: string,
    isSingleValue: boolean
  ): Promise<ImageTagGroup> {
    return await this.imageTagGroupsService.updateImageTagGroup(
      id,
      displayName.trim(),
      isSingleValue
    );
  }

  public async deleteImageTagGroup(id: number): Promise<void> {
    await this.imageTagGroupsService.deleteImageTagGroup(id);
  }

  public async addImageTagToImageTagGroup(
    imageTagGroupID: number,
    displayName: string
  ): Promise<ImageTag> {
    return await this.imageTagGroupsService.addImageTagToImageTagGroup(
      imageTagGroupID,
      displayName.trim()
    );
  }

  public async updateImageTagOfImageTagGroup(
    imageTagGroupID: number,
    imageTagID: number,
    displayName: string
  ): Promise<ImageTag> {
    return await this.imageTagGroupsService.updateImageTagOfImageTagGroup(
      imageTagGroupID,
      imageTagID,
      displayName.trim()
    );
  }

  public async removeImageTagFromImageTagGroup(
    imageTagGroupID: number,
    imageTagID: number
  ): Promise<void> {
    await this.imageTagGroupsService.removeImageTagFromImageTagGroup(
      imageTagGroupID,
      imageTagID
    );
  }

  public async addImageTypeToImageTagGroup(
    imageTagGroupID: number,
    imageTypeID: number
  ): Promise<void> {
    await this.imageTagGroupsService.addImageTypeToImageTagGroup(
      imageTagGroupID,
      imageTypeID
    );
  }

  public async removeImageTypeFromImageTagGroup(
    imageTagGroupID: number,
    imageTypeID: number
  ): Promise<void> {
    await this.imageTagGroupsService.removeImageTypeFromImageTagGroup(
      imageTagGroupID,
      imageTypeID
    );
  }
}
