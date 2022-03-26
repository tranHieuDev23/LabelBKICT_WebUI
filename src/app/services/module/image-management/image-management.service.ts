import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Image,
  ImagesService,
  ImageStatus,
  ImageTag,
  Region,
  UploadImageBatchMessage,
  UploadImageInput,
} from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class ImageManagementService {
  constructor(private readonly imagesService: ImagesService) {}

  public createImageBatch(
    inputList: UploadImageInput[]
  ): Observable<UploadImageBatchMessage> {
    for (const input of inputList) {
      input.description = input.description.trim();
    }
    return this.imagesService.createImageBatch(inputList);
  }

  public async getImage(id: number): Promise<{
    image: Image;
    imageTagList: ImageTag[];
    regionList: Region[];
  }> {
    return this.imagesService.getImage(id);
  }

  public async updateImageMetadata(
    id: number,
    description: string | undefined
  ): Promise<Image> {
    if (description !== undefined) {
      description = description.trim();
    }
    return this.imagesService.updateImageMetadata(id, description);
  }

  public async deleteImage(id: number): Promise<void> {
    await this.imagesService.deleteImage(id);
  }

  public async getImageRegionSnapshotList(
    id: number,
    status: ImageStatus
  ): Promise<Region[]> {
    return await this.imagesService.getImageRegionSnapshotList(id, status);
  }

  public async updateImageImageType(
    id: number,
    imageTypeID: number
  ): Promise<Image> {
    return await this.imagesService.updateImageImageType(id, imageTypeID);
  }

  public async updateImageStatus(
    id: number,
    status: ImageStatus
  ): Promise<Image> {
    return await this.imagesService.updateImageStatus(id, status);
  }

  public async addImageTagToImage(
    id: number,
    imageTagID: number
  ): Promise<void> {
    await this.imagesService.addImageTagToImage(id, imageTagID);
  }

  public async removeImageTagFromImage(
    id: number,
    imageTagID: number
  ): Promise<void> {
    await this.imagesService.removeImageTagFromImage(id, imageTagID);
  }
}
