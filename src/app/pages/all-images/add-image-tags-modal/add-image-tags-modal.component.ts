import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserSearchBoxComponent } from 'src/app/components/user-search-box/user-search-box.component';
import {
  ImageCannotBeAssignedWithImageTagError,
  ImageOrImageTagNotFoundError,
  ImageTag,
  ImageTagGroup,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageListManagementService } from 'src/app/services/module/image-list-management';

@Component({
  selector: 'app-add-image-tags-modal',
  templateUrl: './add-image-tags-modal.component.html',
  styleUrls: ['./add-image-tags-modal.component.scss'],
})
export class AddImageTagsModalComponent {
  @ViewChild(UserSearchBoxComponent, { static: false })
  public userSearchBox: UserSearchBoxComponent | undefined;

  public visible = false;
  public allImageTagGroupList: ImageTagGroup[] = [];
  public allImageTagList: ImageTag[][] = [];
  public currentImageTagList: ImageTag[] = [];
  public addedImageTagList: ImageTag[] = [];

  @Output() ok = new EventEmitter<void>();

  private imageIdList: number[] = [];

  constructor(
    private readonly imageListManagementService: ImageListManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router
  ) {}

  public open(
    allImageTagGroupList: ImageTagGroup[],
    allImageTagList: ImageTag[][],
    currentImageTagList: ImageTag[],
    imageIdList: number[]
  ): void {
    this.allImageTagGroupList = allImageTagGroupList;
    this.allImageTagList = allImageTagList;
    this.currentImageTagList = currentImageTagList;
    this.addedImageTagList = [];
    this.imageIdList = imageIdList;
    this.visible = true;
  }

  public close(): void {
    this.visible = false;
  }

  public onImageTagAdded(imageTag: ImageTag): void {
    this.addedImageTagList = [...this.addedImageTagList, imageTag];
  }

  public onImageTagDeleted(imageTag: ImageTag): void {
    this.addedImageTagList = this.addedImageTagList.filter((item) => item.id !== imageTag.id);
  }

  public async onOk(): Promise<void> {
    this.close();

    const imageTagIdList = this.addedImageTagList.map((imageTag) => imageTag.id);
    try {
      await this.imageListManagementService.addImageTagListToImageList(this.imageIdList, imageTagIdList);
      this.notificationService.success('Added image tag(s) to selected image(s) successfully', '');
      this.ok.emit();
    } catch (e) {
      this.handleError('Failed to add image tag(s) to selected image(s)', e);
    }
  }

  public async onCancel(): Promise<void> {
    this.close();
  }

  private handleError(notificationTitle: string, e: any) {
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
    if (e instanceof ImageOrImageTagNotFoundError) {
      this.notificationService.error(notificationTitle, 'One or more images or image tags not found');
      return;
    }
    if (e instanceof ImageCannotBeAssignedWithImageTagError) {
      this.notificationService.error(notificationTitle, 'One or more image tags cannot be added to one or more images');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
