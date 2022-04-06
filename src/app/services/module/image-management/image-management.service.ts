import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Image,
  ImageBookmark,
  ImagesService,
  ImageStatus,
  ImageTag,
  Region,
  UploadImageBatchMessage,
  UploadImageInput,
} from '../../dataaccess/api';
import { DescriptionFileService } from './description-file.service';

@Injectable({
  providedIn: 'root',
})
export class ImageManagementService {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly descriptionFileService: DescriptionFileService
  ) {}

  public createImageBatch(
    imageFileList: any[],
    imageTypeID: number | null,
    imageTagIDList: number[],
    descriptionFile: File | null
  ): Observable<UploadImageBatchMessage> {
    return new Observable<UploadImageBatchMessage>((subscriber) => {
      this.getFilenameToDescriptionMap(descriptionFile).then(
        (filenameToDescriptionMap) => {
          const uploadImageInputList = [];
          for (const imageFile of imageFileList) {
            const description =
              filenameToDescriptionMap.get(imageFile.name) || '';
            uploadImageInputList.push(
              new UploadImageInput(
                imageFile,
                imageTypeID,
                imageTagIDList,
                description
              )
            );
          }
          this.imagesService
            .createImageBatch(uploadImageInputList)
            .subscribe(subscriber);
        }
      );
    });
  }

  private async getFilenameToDescriptionMap(
    descriptionFile: File | null
  ): Promise<Map<string, string>> {
    const filenameToDescriptionMap = new Map<string, string>();
    if (descriptionFile === null) {
      return filenameToDescriptionMap;
    }
    const filenameToDescriptionList =
      await this.descriptionFileService.parseDescriptionFile(descriptionFile);
    for (const item of filenameToDescriptionList) {
      filenameToDescriptionMap.set(item.filename, item.description);
    }
    return filenameToDescriptionMap;
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

  public async createImageDetectionTask(id: number): Promise<void> {
    await this.imagesService.createImageDetectionTask(id);
  }

  public async createImageBookmark(
    id: number,
    description: string
  ): Promise<ImageBookmark> {
    return await this.imagesService.createImageBookmark(id, description.trim());
  }

  public async getImageBookmark(id: number): Promise<ImageBookmark> {
    return await this.imagesService.getImageBookmark(id);
  }

  public async updateImageBookmark(
    id: number,
    description: string | undefined
  ): Promise<ImageBookmark> {
    return await this.imagesService.updateImageBookmark(
      id,
      description?.trim()
    );
  }

  public async deleteImageBookmark(id: number): Promise<void> {
    return await this.imagesService.deleteImageBookmark(id);
  }
}
