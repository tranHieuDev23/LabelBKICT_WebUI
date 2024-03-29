import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ImageTag,
  ImageTagGroup,
  ImageTagGroupAlreadyHasImageTypeError,
  ImageTagGroupDoesNotHaveImageTypeError,
  ImageTagGroupNotFoundError,
  ImageTagGroupOrImageTypeNotFoundError,
  ImageTagNotFoundError,
  ImageType,
  ImageTypesService,
  InvalidImageTagGroupInformationError,
  InvalidImageTagInformationError,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageTagManagementService } from 'src/app/services/module/image-tag-management';

@Component({
  selector: 'app-manage-image-tags',
  templateUrl: './manage-image-tags.component.html',
  styleUrls: ['./manage-image-tags.component.scss'],
})
export class ManageImageTagsComponent implements OnInit {
  public imageTagGroupList: ImageTagGroup[] = [];
  public imageTagList: ImageTag[][] = [];
  public imageTypeList: ImageType[][] = [];
  public isImageTagGroupCollapsePanelOpen: boolean[] = [];

  public isImageTagGroupCollapsePanelAddingImageTagVisible: boolean[] = [];
  public imageTagGroupCollapsePanelAddingImageTagDisplayName: string[] = [];

  public isNewImageTagGroupPanelVisible: boolean = false;
  public newImageTagGroupDisplayName: string = '';

  public isAddImageTypeModalVisible: boolean = false;
  public addImageTypeModalImageTagGroupIndex: number = 0;
  public addImageTypeModalAllImageTypeList: ImageType[] = [];
  public addImageTypeModalImageTypeList: ImageType[] = [];

  constructor(
    private readonly imageTagManagementService: ImageTagManagementService,
    private readonly imageTypesService: ImageTypesService,
    private readonly notificationService: NzNotificationService,
    private readonly modalService: NzModalService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      try {
        const { imageTagGroupList, imageTagList, imageTypeList } =
          await this.imageTagManagementService.getImageTagGroupList();
        this.imageTagGroupList = imageTagGroupList;
        this.imageTagList = imageTagList;
        this.imageTypeList = imageTypeList;
        this.isImageTagGroupCollapsePanelOpen = new Array<boolean>(imageTagGroupList.length).fill(false);
        this.isImageTagGroupCollapsePanelAddingImageTagVisible = new Array<boolean>(imageTagGroupList.length).fill(
          false
        );
        this.imageTagGroupCollapsePanelAddingImageTagDisplayName = new Array<string>(imageTagGroupList.length).fill('');

        const { imageTypeList: addImageTypeModalImageTypeList } = await this.imageTypesService.getImageTypeList(false);
        this.addImageTypeModalAllImageTypeList = addImageTypeModalImageTypeList;
      } catch (e) {
        if (e instanceof UnauthenticatedError) {
          this.notificationService.error('Failed to get image tag group list', 'User is not logged in');
          this.router.navigateByUrl('/login');
        } else if (e instanceof UnauthorizedError) {
          this.notificationService.error(
            'Failed to get image tag group list',
            "User doesn't have the required permission"
          );
          this.router.navigateByUrl('/welcome');
        } else {
          this.notificationService.error('Failed to get image tag group list', 'Unknown error');
        }
      }
    })().then();
  }

  public async onImageTagGroupDisplayNameEdited(index: number, newDisplayName: string): Promise<void> {
    let imageTagGroup: ImageTagGroup;
    try {
      imageTagGroup = await this.imageTagManagementService.updateImageTagGroup(
        this.imageTagGroupList[index].id,
        newDisplayName,
        this.imageTagGroupList[index].isSingleValue
      );
    } catch (e) {
      if (e instanceof InvalidImageTagGroupInformationError) {
        this.notificationService.error('Failed to update image tag group', 'Invalid image tag group information');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to update image tag group', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error('Failed to update image tag group', "User doesn't have the required permission");
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTagGroupNotFoundError) {
        this.notificationService.error('Failed to update image tag group', 'Cannot find image tag group');
      } else {
        this.notificationService.error('Failed to update image tag group', 'Unknown error');
      }
      return;
    }

    this.notificationService.success('Updated image tag group successfully', '');
    this.imageTagGroupList[index] = imageTagGroup;
    this.refreshAllArray();
  }

  public async onImageTagGroupImageTypeDeleteClicked(
    imageTagGroupIndex: number,
    imageTypeIndex: number
  ): Promise<void> {
    try {
      await this.imageTagManagementService.removeImageTypeFromImageTagGroup(
        this.imageTagGroupList[imageTagGroupIndex].id,
        this.imageTypeList[imageTagGroupIndex][imageTypeIndex].id
      );
    } catch (e) {
      if (e instanceof InvalidImageTagInformationError) {
        this.notificationService.error(
          'Failed to remove image type from image tag group',
          'Invalid image tag information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to remove image type from image tag group', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to remove image type from image tag group',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTagGroupOrImageTypeNotFoundError) {
        this.notificationService.error(
          'Failed to remove image type from image tag group',
          'Cannot find image tag group or image type'
        );
      } else if (e instanceof ImageTagGroupDoesNotHaveImageTypeError) {
        this.notificationService.error(
          'Failed to remove image type from image tag group',
          'Image tag group does not have image type'
        );
      } else {
        this.notificationService.error('Failed to remove image type from image tag group', 'Unknown error');
      }
      return;
    }

    this.notificationService.success('Removed image type from image tag group successfully', '');
    this.imageTypeList[imageTagGroupIndex].splice(imageTypeIndex, 1);
    this.refreshAllArray();
  }

  public onImageTagGroupAddImageTypeClicked(index: number): void {
    const addedImageTypeIDSet = new Set<number>();
    for (const imageType of this.imageTypeList[index]) {
      addedImageTypeIDSet.add(imageType.id);
    }

    this.addImageTypeModalImageTagGroupIndex = index;
    this.addImageTypeModalImageTypeList = this.addImageTypeModalAllImageTypeList.filter((imageType) => {
      return !addedImageTypeIDSet.has(imageType.id);
    });
    this.isAddImageTypeModalVisible = true;
  }

  public async onAddImageTypeModalImageTypeClicked(imageType: ImageType): Promise<void> {
    try {
      await this.imageTagManagementService.addImageTypeToImageTagGroup(
        this.imageTagGroupList[this.addImageTypeModalImageTagGroupIndex].id,
        imageType.id
      );
    } catch (e) {
      if (e instanceof InvalidImageTagInformationError) {
        this.notificationService.error('Failed to add image type to image tag group', 'Invalid image tag information');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to add image type to image tag group', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to add image type to image tag group',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTagGroupOrImageTypeNotFoundError) {
        this.notificationService.error(
          'Failed to add image type to image tag group',
          'Cannot find image tag group or image type'
        );
      } else if (e instanceof ImageTagGroupAlreadyHasImageTypeError) {
        this.notificationService.error(
          'Failed to add image type to image tag group',
          'Image tag group already has image type'
        );
      } else {
        this.notificationService.error('Failed to add image type to image tag group', 'Unknown error');
      }
      return;
    }

    this.notificationService.success('Added image type to image tag group successfully', '');
    this.imageTypeList[this.addImageTypeModalImageTagGroupIndex].push(imageType);
    this.isAddImageTypeModalVisible = false;
    this.refreshAllArray();
  }

  public onAddImageTypeModalCancel(): void {
    this.isAddImageTypeModalVisible = false;
  }

  public async onImageTagGroupImageTagDisplayNameEdited(
    imageTagGroupIndex: number,
    imageTagIndex: number,
    newDisplayName: string
  ): Promise<void> {
    let imageTag: ImageTag;
    try {
      imageTag = await this.imageTagManagementService.updateImageTagOfImageTagGroup(
        this.imageTagGroupList[imageTagGroupIndex].id,
        this.imageTagList[imageTagGroupIndex][imageTagIndex].id,
        newDisplayName
      );
    } catch (e) {
      if (e instanceof InvalidImageTagInformationError) {
        this.notificationService.error('Failed to update image tag', 'Invalid image tag information');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to update image tag', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error('Failed to update image tag', "User doesn't have the required permission");
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTagNotFoundError) {
        this.notificationService.error('Failed to update image tag', 'Cannot find image tag');
      } else {
        this.notificationService.error('Failed to update image tag', 'Unknown error');
      }
      return;
    }

    this.notificationService.success('Updated image tag successfully', '');
    this.imageTagList[imageTagGroupIndex][imageTagIndex] = imageTag;
    this.refreshAllArray();
  }

  public onImageTagGroupImageTagDeleteClicked(imageTagGroupIndex: number, imageTagIndex: number): void {
    this.modalService.warning({
      nzTitle: 'Delete image tag',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await this.imageTagManagementService.removeImageTagFromImageTagGroup(
            this.imageTagGroupList[imageTagGroupIndex].id,
            this.imageTagList[imageTagGroupIndex][imageTagIndex].id
          );
        } catch (e) {
          if (e instanceof InvalidImageTagInformationError) {
            this.notificationService.error('Failed to delete image tag', 'Invalid image tag information');
          } else if (e instanceof UnauthenticatedError) {
            this.notificationService.error('Failed to delete image tag', 'User is not logged in');
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error('Failed to delete image tag', "User doesn't have the required permission");
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof ImageTagNotFoundError) {
            this.notificationService.error('Failed to delete image tag', 'Cannot find image tag');
          } else {
            this.notificationService.error('Failed to delete image tag', 'Unknown error');
          }
          return;
        }

        this.notificationService.success('Deleted image tag successfully', '');
        this.imageTagList[imageTagGroupIndex].splice(imageTagIndex, 1);
        this.refreshAllArray();
      },
    });
  }

  public onImageTagGroupNewImageTagDisplayNameEditingEnd(index: number): void {
    this.isImageTagGroupCollapsePanelAddingImageTagVisible[index] = false;
  }

  public async onImageTagGroupNewImageTagDisplayNameEdited(index: number, newDisplayName: string): Promise<void> {
    let imageTag: ImageTag;
    try {
      imageTag = await this.imageTagManagementService.addImageTagToImageTagGroup(
        this.imageTagGroupList[index].id,
        newDisplayName
      );
    } catch (e) {
      if (e instanceof InvalidImageTagInformationError) {
        this.notificationService.error('Failed to create image tag', 'Invalid image tag information');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to create image tag', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error('Failed to create image tag', "User doesn't have the required permission");
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTagNotFoundError) {
        this.notificationService.error('Failed to create image tag', 'Cannot find image tag group');
      } else {
        this.notificationService.error('Failed to create image tag', 'Unknown error');
      }
      return;
    }

    this.notificationService.success('Created image tag successfully', '');
    this.imageTagList[index].push(imageTag);
    this.refreshAllArray();
  }

  public onNewImageTagValueClicked(index: number): void {
    this.imageTagGroupCollapsePanelAddingImageTagDisplayName[index] = '';
    this.isImageTagGroupCollapsePanelAddingImageTagVisible[index] = true;
  }

  public async onImageTagGroupIsSingleValueChanged(index: number, newIsSingleValue: boolean): Promise<void> {
    let imageTagGroup: ImageTagGroup;
    try {
      imageTagGroup = await this.imageTagManagementService.updateImageTagGroup(
        this.imageTagGroupList[index].id,
        this.imageTagGroupList[index].displayName,
        newIsSingleValue
      );
    } catch (e) {
      if (e instanceof InvalidImageTagGroupInformationError) {
        this.notificationService.error('Failed to update image tag group', 'Invalid image tag group information');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to update image tag group', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error('Failed to update image tag group', "User doesn't have the required permission");
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTagGroupNotFoundError) {
        this.notificationService.error('Failed to update image tag group', 'Cannot find image tag group');
      } else {
        this.notificationService.error('Failed to update image tag group', 'Unknown error');
      }
      return;
    }

    this.notificationService.success('Updated image tag group successfully', '');
    this.imageTagGroupList[index] = imageTagGroup;
    this.refreshAllArray();
  }

  public onDeleteImageTagGroupClicked(index: number): void {
    this.modalService.warning({
      nzTitle: 'Delete image tag group',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOnOk: async () => {
        try {
          await this.imageTagManagementService.deleteImageTagGroup(this.imageTagGroupList[index].id);
        } catch (e) {
          if (e instanceof UnauthenticatedError) {
            this.notificationService.error('Failed to delete image tag group', 'User is not logged in');
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to delete image tag group',
              "User doesn't have the required permission"
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof ImageTagGroupNotFoundError) {
            this.notificationService.error('Failed to delete image tag group', 'Cannot find image tag group');
          } else {
            this.notificationService.error('Failed to delete image tag group', 'Unknown error');
          }
          return;
        }

        this.notificationService.success('Deleted image tag group successfully', '');
        this.imageTagGroupList.splice(index, 1);
        this.imageTagList.splice(index, 1);
        this.imageTypeList.splice(index, 1);
        this.isImageTagGroupCollapsePanelOpen.splice(index, 1);
        this.isImageTagGroupCollapsePanelAddingImageTagVisible.splice(index, 1);
        this.imageTagGroupCollapsePanelAddingImageTagDisplayName.splice(index, 1);
        this.refreshAllArray();
      },
    });
  }

  public onNewImageTagGroupDisplayNameEditingEnd(): void {
    this.isNewImageTagGroupPanelVisible = false;
  }

  public async onNewImageTagGroupDisplayNameEdited(newDisplayName: string): Promise<void> {
    let imageTagGroup: ImageTagGroup;
    try {
      imageTagGroup = await this.imageTagManagementService.createImageTagGroup(newDisplayName, false);
    } catch (e) {
      if (e instanceof InvalidImageTagGroupInformationError) {
        this.notificationService.error('Failed to create image tag group', 'Invalid image tag group information');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to create image tag group', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error('Failed to create image tag group', "User doesn't have the required permission");
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error('Failed to create image tag group', 'Unknown error');
      }
      return;
    }

    this.notificationService.success('Created image tag group successfully', '');
    this.imageTagGroupList.push(imageTagGroup);
    this.imageTagList.push([]);
    this.imageTypeList.push([]);
    this.isImageTagGroupCollapsePanelOpen.push(false);
    this.isImageTagGroupCollapsePanelAddingImageTagVisible.push(false);
    this.imageTagGroupCollapsePanelAddingImageTagDisplayName.push('');
    this.refreshAllArray();
  }

  public onNewImageTagGroupClicked(): void {
    this.newImageTagGroupDisplayName = '';
    this.isNewImageTagGroupPanelVisible = true;
  }

  private refreshAllArray(): void {
    this.imageTagGroupList = [...this.imageTagGroupList];
    this.imageTagList = [...this.imageTagList];
    this.imageTypeList = [...this.imageTypeList];
    this.isImageTagGroupCollapsePanelOpen = [...this.isImageTagGroupCollapsePanelOpen];
    this.isImageTagGroupCollapsePanelAddingImageTagVisible = [
      ...this.isImageTagGroupCollapsePanelAddingImageTagVisible,
    ];
    this.imageTagGroupCollapsePanelAddingImageTagDisplayName = [
      ...this.imageTagGroupCollapsePanelAddingImageTagDisplayName,
    ];
  }
}
