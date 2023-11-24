import { Location } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  DetectionTaskAlreadyExistsError,
  Image,
  ImageNotFoundError,
  ImageOrImageTypeNotFoundError,
  ImageType,
  OneOrMoreImagesNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { ImageTypeManagementService } from 'src/app/services/module/image-type-management';

@Component({
  selector: 'app-image-settings-modal',
  templateUrl: './image-settings-modal.component.html',
  styleUrls: ['./image-settings-modal.component.scss'],
})
export class ImageSettingsModalComponent {
  public visible = false;
  public image: Image | undefined;
  public imageTypeList: ImageType[] = [];
  public selectedImageType: ImageType | undefined;

  @Output() imageTypeUpdated = new EventEmitter<ImageType>();

  constructor(
    private readonly imageManagementService: ImageManagementService,
    private readonly imageTypeManagementService: ImageTypeManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  public async open(image: Image): Promise<void> {
    try {
      const { imageTypeList } = await this.imageTypeManagementService.getImageTypeList();
      this.imageTypeList = imageTypeList;
    } catch (e) {
      this.handleError('Failed to get image type list', e);
      return;
    }

    this.image = image;
    this.selectedImageType = undefined;
    this.visible = true;
  }

  public close(): void {
    this.visible = false;
  }

  public async onImageTypeClicked(imageType: ImageType): Promise<void> {
    if (!this.image) {
      return;
    }
    this.close();
    try {
      await this.imageManagementService.updateImageImageType(this.image.id, imageType.id);
    } catch (e) {
      this.handleError('Failed to update image type', e);
      return;
    }
    this.notificationService.success('Updated image type successfully', '');
    this.imageTypeUpdated.emit(imageType);
  }

  public async onRequestDetectionClicked(): Promise<void> {
    if (!this.image) {
      return;
    }
    this.close();
    try {
      await this.imageManagementService.createImageDetectionTask(this.image.id);
    } catch (e) {
      this.handleError('Failed to request for lesion suggestion', e);
      return;
    }
    this.notificationService.success('Requested for lesion suggestion successfully', '');
  }

  public async onDeleteImageClicked(): Promise<void> {
    if (!this.image) {
      return;
    }
    this.close();
    try {
      await this.imageManagementService.deleteImage(this.image.id);
    } catch (e) {
      this.handleError('Failed to delete image', e);
      return;
    }
    this.notificationService.success('Deleted image successfully', '');
    this.location.back();
  }

  private handleError(notificationTitle: string, e: any): void {
    if (e instanceof UnauthenticatedError) {
      this.notificationService.error(notificationTitle, 'User is not logged in');
      this.router.navigateByUrl('/login');
      return;
    }
    if (e instanceof UnauthorizedError) {
      this.notificationService.error(notificationTitle, 'User does not have the required permission');
      this.router.navigateByUrl('/welcome');
      return;
    }
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image not found');
      this.location.back();
      return;
    }
    if (e instanceof OneOrMoreImagesNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image not found');
      this.location.back();
      return;
    }
    if (e instanceof ImageOrImageTypeNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image or image type not found');
      return;
    }
    if (e instanceof DetectionTaskAlreadyExistsError) {
      this.notificationService.error(notificationTitle, 'Image already has pending detection task');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
