import { Injectable } from '@angular/core';
import {
  ImageType,
  ImageTypesService,
  RegionLabel,
} from '../../dataaccess/api';
import { ImageTagGroupAndTagList } from '../../dataaccess/api/schemas/image_tag_group_and_tag_list';

@Injectable({
  providedIn: 'root',
})
export class ImageTypeManagementService {
  constructor(private readonly imageTypesService: ImageTypesService) {}

  public async createImageType(
    displayName: string,
    hasPredictiveModel: boolean
  ): Promise<ImageType> {
    return await this.imageTypesService.createImageType(
      displayName.trim(),
      hasPredictiveModel
    );
  }

  public async getImageType(id: number): Promise<{
    imageType: ImageType;
    regionLabelList: RegionLabel[];
  }> {
    return await this.imageTypesService.getImageType(id);
  }

  public async getImageTypeList(): Promise<{
    imageTypeList: ImageType[];
    regionLabelList: RegionLabel[][];
  }> {
    const { imageTypeList, regionLabelList } =
      await this.imageTypesService.getImageTypeList(true);
    if (regionLabelList === undefined) {
      throw new Error('Invalid region label list response from API');
    }
    return {
      imageTypeList,
      regionLabelList,
    };
  }

  public async updateImageType(
    id: number,
    displayName: string,
    hasPredictiveModel: boolean
  ): Promise<ImageType> {
    return await this.imageTypesService.updateImageType(
      id,
      displayName.trim(),
      hasPredictiveModel
    );
  }

  public async deleteImageType(id: number): Promise<void> {
    await this.imageTypesService.deleteImageType(id);
  }

  public async addRegionLabelToImageType(
    imageTypeID: number,
    displayName: string,
    color: string
  ): Promise<RegionLabel> {
    return await this.imageTypesService.addRegionLabelToImageType(
      imageTypeID,
      displayName.trim(),
      color.trim()
    );
  }

  public async updateRegionLabelOfImageType(
    imageTypeID: number,
    regionLabelID: number,
    displayName: string,
    color: string
  ): Promise<RegionLabel> {
    return await this.imageTypesService.updateRegionLabelOfImageType(
      imageTypeID,
      regionLabelID,
      displayName.trim(),
      color.trim()
    );
  }

  public async removeRegionLabelFromImageType(
    imageTypeID: number,
    regionLabelID: number
  ): Promise<void> {
    await this.imageTypesService.removeRegionLabelFromImageType(
      imageTypeID,
      regionLabelID
    );
  }

  public async getImageTagGroupListOfImageType(
    imageTypeID: number
  ): Promise<ImageTagGroupAndTagList> {
    return await this.imageTypesService.getImageTagGroupListOfImageType(
      imageTypeID
    );
  }

  public async getImageTagGroupListOfImageTypeList(
    imageTypeIDList: number[]
  ): Promise<ImageTagGroupAndTagList[]> {
    return await this.imageTypesService.getImageTagGroupListOfImageTypeList(
      imageTypeIDList
    );
  }
}
