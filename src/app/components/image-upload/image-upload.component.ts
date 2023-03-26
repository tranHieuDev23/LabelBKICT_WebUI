import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import {
  ImageTag,
  ImageTagGroup,
  ImageType,
  UnauthenticatedError,
  UnauthorizedError,
  UploadImageBatchMessage,
  UploadImageBatchMessageType,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { ImageTypeManagementService } from 'src/app/services/module/image-type-management';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  @Input() public isMultipleUpload = false;
  @Input() public isDirectoryUpload = false;
  @Input() public fileSizeLimit = 0;
  @Input() public description = '';
  @Input() public hint = '';

  @Input() public allImageTypeList: ImageType[] = [];

  public allowedImageTagGroupListForImageType: ImageTagGroup[] = [];
  public allowedImageTagListForImageType: ImageTag[][] = [];

  public nzFileList: NzUploadFile[] = [];

  public onBeforeUpload = (newFile: NzUploadFile): boolean => {
    this.nzFileList = this.nzFileList.concat(newFile);
    return false;
  };

  public onRemove = (removedFile: NzUploadFile): boolean => {
    this.nzFileList = this.nzFileList.filter((file) => file.uid !== removedFile.uid);
    return true;
  };

  public imageTypeForUploadedImage: ImageType | null = null;
  public shouldUsePredictiveModel = false;
  public imageTagListForUploadedImage: ImageTag[] = [];
  public descriptionFileForUploadedImage: File | null = null;

  public isUploading = false;

  @Output() public uploadSuccess = new EventEmitter<NzUploadFile>();
  @Output() public uploadFailure = new EventEmitter<NzUploadFile>();

  constructor(
    private readonly imageTypeManagementService: ImageTypeManagementService,
    private readonly imageManagementService: ImageManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router
  ) {}

  public async onImageTypeForUploadedImageChanged(imageType: ImageType | null) {
    this.imageTagListForUploadedImage = [];

    if (imageType === null) {
      this.allowedImageTagGroupListForImageType = [];
      this.allowedImageTagListForImageType = [];
      this.imageTagListForUploadedImage = [];
      return;
    }

    try {
      const { imageTagGroupList, imageTagList: imageTagListOfImageTagGroupList } =
        await this.imageTypeManagementService.getImageTagGroupListOfImageType(imageType.id);
      this.allowedImageTagGroupListForImageType = imageTagGroupList;
      this.allowedImageTagListForImageType = imageTagListOfImageTagGroupList;
      this.imageTagListForUploadedImage = [];
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to get allowed image tag list for image type', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to get allowed image tag list for image type',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error('Failed to get allowed image tag list for image type', 'Unknown error');
        this.router.navigateByUrl('/welcome');
      }
    }
  }

  public isShouldUsePredictiveModelToggleEnabled(): boolean {
    if (this.isUploading || this.imageTypeForUploadedImage === null) {
      return false;
    }
    return this.imageTypeForUploadedImage.hasPredictiveModel;
  }

  public onImageTagForUploadedImageAdded(addedImageTag: ImageTag): void {
    this.imageTagListForUploadedImage = [...this.imageTagListForUploadedImage, addedImageTag];
  }

  public onImageTagForUploadedImageDeleted(deletedImageTag: ImageTag): void {
    this.imageTagListForUploadedImage = this.imageTagListForUploadedImage.filter(
      (imageTag) => imageTag.id !== deletedImageTag.id
    );
  }

  public onDescriptionFileForUploadedImageSelected(event: Event): void {
    const targetElement = event.currentTarget as HTMLInputElement;
    if (targetElement === null || targetElement.files === null) {
      return;
    }
    const fileList = targetElement.files;
    if (fileList.length === 0) {
      this.descriptionFileForUploadedImage = null;
    } else {
      this.descriptionFileForUploadedImage = fileList.item(0);
    }
  }

  public async onUploadClicked(): Promise<void> {
    if (this.isUploading) {
      return;
    }
    this.isUploading = true;

    const imageFileList = this.nzFileList.filter((file) => !file.status);
    for (const imageFile of imageFileList) {
      imageFile.status = 'uploading';
    }
    this.nzFileList = [...this.nzFileList];

    const imageTypeID = this.imageTypeForUploadedImage === null ? null : this.imageTypeForUploadedImage.id;
    const imageTagIDList = this.imageTagListForUploadedImage.map((imageTag) => imageTag.id);

    this.imageManagementService
      .createImageBatch(imageFileList, imageTypeID, imageTagIDList, this.descriptionFileForUploadedImage)
      .subscribe((message) => this.handleUploadImageBatchMessage(imageFileList, message));
  }

  private handleUploadImageBatchMessage(imageFileList: NzUploadFile[], message: UploadImageBatchMessage): void {
    switch (message.type) {
      case UploadImageBatchMessageType.UPLOAD_SUCCESS:
        const successIndex: number = message.data;
        const successFile = imageFileList[successIndex];
        successFile.status = 'success';
        this.nzFileList = [...this.nzFileList];
        this.uploadSuccess.emit(successFile);
        break;
      case UploadImageBatchMessageType.UPLOAD_FAILURE:
        const failureIndex: number = message.data;
        const failureFile = imageFileList[failureIndex];
        failureFile.status = 'error';
        this.nzFileList = [...this.nzFileList];
        this.uploadFailure.emit(failureFile);
        break;
      case UploadImageBatchMessageType.UPLOAD_COMPLETE:
        this.isUploading = false;
        break;
    }
  }
}
