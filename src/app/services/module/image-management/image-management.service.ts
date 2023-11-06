import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Image,
  ImageBookmark,
  ImageListService,
  ImagesService,
  ImageStatus,
  ImageTag,
  Region,
  UploadImageBatchMessage,
  UploadImageInput,
  User,
} from '../../dataaccess/api';
import { DescriptionFileService } from './description-file.service';
import { FreePolygon } from 'src/app/components/region-selector/models';
import { ColorService } from 'src/app/components/region-selector/graphic/color.service';
import { CanvasGraphicService } from 'src/app/components/region-selector/graphic/canvas-graphic.service';

const DEFAULT_REGION_LABEL_COLOR = '#13c2c2';

@Injectable({
  providedIn: 'root',
})
export class ImageManagementService {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly imageListService: ImageListService,
    private readonly descriptionFileService: DescriptionFileService,
    private readonly canvasGraphicService: CanvasGraphicService,
    private readonly colorService: ColorService
  ) {}

  public createImageBatch(
    imageFileList: any[],
    imageTypeID: number | null,
    imageTagIDList: number[],
    descriptionFile: File | null,
    shouldUseDetectionModel: boolean
  ): Observable<UploadImageBatchMessage> {
    return new Observable<UploadImageBatchMessage>((subscriber) => {
      this.getFilenameToDescriptionMap(descriptionFile).then((filenameToDescriptionMap) => {
        const uploadImageInputList = [];
        for (const imageFile of imageFileList) {
          const description = filenameToDescriptionMap.get(imageFile.name) || '';
          uploadImageInputList.push(
            new UploadImageInput(imageFile, imageTypeID, imageTagIDList, description, shouldUseDetectionModel)
          );
        }
        this.imagesService.createImageBatch(uploadImageInputList).subscribe(subscriber);
      });
    });
  }

  private async getFilenameToDescriptionMap(descriptionFile: File | null): Promise<Map<string, string>> {
    const filenameToDescriptionMap = new Map<string, string>();
    if (descriptionFile === null) {
      return filenameToDescriptionMap;
    }
    const filenameToDescriptionList = await this.descriptionFileService.parseDescriptionFile(descriptionFile);
    for (const item of filenameToDescriptionList) {
      filenameToDescriptionMap.set(item.filename, item.description);
    }
    return filenameToDescriptionMap;
  }

  public async getImage(id: number): Promise<{
    image: Image;
    imageTagList: ImageTag[];
    regionList: Region[];
    canEdit: boolean;
    canVerify: boolean;
  }> {
    return this.imagesService.getImage(id);
  }

  public async updateImageMetadata(id: number, description: string | undefined): Promise<Image> {
    if (description !== undefined) {
      description = description.trim();
    }
    return this.imagesService.updateImageMetadata(id, description);
  }

  public async deleteImage(id: number): Promise<void> {
    await this.imagesService.deleteImage(id);
  }

  public async getImageRegionSnapshotList(id: number, status: ImageStatus): Promise<Region[]> {
    return await this.imagesService.getImageRegionSnapshotList(id, status);
  }

  public async updateImageImageType(id: number, imageTypeID: number): Promise<Image> {
    return await this.imagesService.updateImageImageType(id, imageTypeID);
  }

  public async updateImageStatus(id: number, status: ImageStatus): Promise<Image> {
    return await this.imagesService.updateImageStatus(id, status);
  }

  public async addImageTagToImage(id: number, imageTagID: number): Promise<void> {
    await this.imagesService.addImageTagToImage(id, imageTagID);
  }

  public async removeImageTagFromImage(id: number, imageTagID: number): Promise<void> {
    await this.imagesService.removeImageTagFromImage(id, imageTagID);
  }

  public async createImageDetectionTask(id: number): Promise<void> {
    await this.imageListService.createImageDetectionTaskList([id]);
  }

  public async createImageBookmark(id: number, description: string): Promise<ImageBookmark> {
    return await this.imagesService.createImageBookmark(id, description.trim());
  }

  public async getImageBookmark(id: number): Promise<ImageBookmark> {
    return await this.imagesService.getImageBookmark(id);
  }

  public async updateImageBookmark(id: number, description: string | undefined): Promise<ImageBookmark> {
    return await this.imagesService.updateImageBookmark(id, description?.trim());
  }

  public async deleteImageBookmark(id: number): Promise<void> {
    return await this.imagesService.deleteImageBookmark(id);
  }

  public async generateImageWithRegions(image: Image, regionList: Region[]): Promise<string> {
    return new Promise<string>((resolve) => {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
          resolve('');
          return;
        }

        ctx.drawImage(img, 0, 0);
        this.canvasGraphicService.clearContext(ctx);

        for (const region of regionList) {
          const regionLabelColor = region.label?.color || DEFAULT_REGION_LABEL_COLOR;
          const borderShape = new FreePolygon(region.border.vertices);
          ctx.lineWidth = 2;
          ctx.strokeStyle = regionLabelColor;
          borderShape.draw(canvas.width, canvas.height, ctx);
          this.canvasGraphicService.clearContext(ctx);

          for (const hole of region.holes) {
            const holeShape = new FreePolygon(hole.vertices);
            ctx.lineWidth = 2;
            ctx.fillStyle = this.colorService.getTransparentVersionOfColor(regionLabelColor);
            holeShape.draw(canvas.width, canvas.height, ctx);
          }
          this.canvasGraphicService.clearContext(ctx);
        }

        resolve(canvas.toDataURL());
      };

      img.src = image.originalImageURL;
    });
  }

  public async getManageableUsersOfImage(
    imageId: number,
    offset: number = 0,
    limit: number = 10
  ): Promise<{
    totalUserCount: number;
    userList: { user: User; canEdit: boolean }[];
  }> {
    return this.imagesService.getManageableUsersOfImage(imageId, offset, limit);
  }

  public async addManageableUserToImage(
    imageId: number,
    userId: number,
    canEdit: boolean
  ): Promise<{ user: User; canEdit: boolean }> {
    return this.imagesService.addManageableUserToImage(imageId, userId, canEdit);
  }

  public async updateManageableUserOfImage(
    imageId: number,
    userId: number,
    canEdit: boolean
  ): Promise<{ user: User; canEdit: boolean }> {
    return this.imagesService.updateManageableUserOfImage(imageId, userId, canEdit);
  }

  public async removeManageableUserOfImage(imageId: number, userId: number): Promise<void> {
    await this.imagesService.removeManageableUserOfImage(imageId, userId);
  }

  public async getVerifiableUsersOfImage(
    imageId: number,
    offset: number,
    limit: number
  ): Promise<{
    totalUserCount: number;
    userList: User[];
  }> {
    return this.imagesService.getVerifiableUsersOfImage(imageId, offset, limit);
  }

  public async addVerifiableUserToImage(imageId: number, userId: number): Promise<User> {
    return this.imagesService.addVerifiableUserToImage(imageId, userId);
  }

  public async removeVerifiableUserOfImage(imageId: number, userId: number): Promise<void> {
    await this.imagesService.removeVerifiableUserOfImage(imageId, userId);
  }
}
