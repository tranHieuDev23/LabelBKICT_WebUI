import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ImageType,
  ImageTypeNotFoundError,
  InvalidImageTypeInformationError,
  InvalidRegionLabelInformationError,
  RegionLabel,
  RegionLabelNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageTypeManagementService } from 'src/app/services/module/image-type-management';
import { RandomColorService } from 'src/app/services/utils/random-color/random-color.service';

@Component({
  selector: 'app-manage-image-types',
  templateUrl: './manage-image-types.component.html',
  styleUrls: ['./manage-image-types.component.scss'],
})
export class ManageImageTypesComponent implements OnInit {
  public imageTypeList: ImageType[] = [];
  public regionLabelList: RegionLabel[][] = [];
  public isImageTypeCollapsePanelOpen: boolean[] = [];

  public isImageTypeCollapsePanelAddingRegionLabelVisible: boolean[] = [];
  public imageTypeCollapsePanelAddingRegionLabelDisplayName: string[] = [];

  public isNewImageTypePanelVisible: boolean = false;
  public newImageTypeDisplayName: string = '';

  constructor(
    private readonly imageTypeManagementService: ImageTypeManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly randomColorService: RandomColorService,
    private readonly modalService: NzModalService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      try {
        const { imageTypeList, regionLabelList } =
          await this.imageTypeManagementService.getImageTypeList();
        this.imageTypeList = imageTypeList;
        this.regionLabelList = regionLabelList;
        this.isImageTypeCollapsePanelOpen = new Array<boolean>(
          imageTypeList.length
        ).fill(false);
        this.isImageTypeCollapsePanelAddingRegionLabelVisible =
          new Array<boolean>(imageTypeList.length).fill(false);
        this.imageTypeCollapsePanelAddingRegionLabelDisplayName =
          new Array<string>(imageTypeList.length).fill('');
      } catch (e) {
        if (e instanceof UnauthenticatedError) {
          this.notificationService.error(
            'Failed to get image type list',
            'User is not logged in'
          );
          this.router.navigateByUrl('/login');
        } else if (e instanceof UnauthorizedError) {
          this.notificationService.error(
            'Failed to get image type list',
            "User doesn't have the required permission"
          );
          this.router.navigateByUrl('/welcome');
        } else {
          this.notificationService.error(
            'Failed to get image type list',
            'Unknown error'
          );
        }
      }
    })().then();
  }

  public async onImageTypeDisplayNameEdited(
    index: number,
    newDisplayName: string
  ): Promise<void> {
    let imageType: ImageType;
    try {
      imageType = await this.imageTypeManagementService.updateImageType(
        this.imageTypeList[index].id,
        newDisplayName,
        this.imageTypeList[index].hasPredictiveModel
      );
    } catch (e) {
      if (e instanceof InvalidImageTypeInformationError) {
        this.notificationService.error(
          'Failed to update image type',
          'Invalid image type information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update image type',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update image type',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTypeNotFoundError) {
        this.notificationService.error(
          'Failed to update image type',
          'Cannot find image type'
        );
      } else {
        this.notificationService.error(
          'Failed to update image type',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Updated image type successfully', '');
    this.imageTypeList[index] = imageType;
    this.refreshAllArray();
  }

  public async onImageTypeRegionLabelDisplayNameEdited(
    imageTypeIndex: number,
    regionLabelIndex: number,
    newDisplayName: string
  ): Promise<void> {
    let regionLabel: RegionLabel;
    try {
      regionLabel =
        await this.imageTypeManagementService.updateRegionLabelOfImageType(
          this.imageTypeList[imageTypeIndex].id,
          this.regionLabelList[imageTypeIndex][regionLabelIndex].id,
          newDisplayName,
          this.regionLabelList[imageTypeIndex][regionLabelIndex].color
        );
    } catch (e) {
      if (e instanceof InvalidRegionLabelInformationError) {
        this.notificationService.error(
          'Failed to update region label',
          'Invalid region label information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update region label',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update region label',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof RegionLabelNotFoundError) {
        this.notificationService.error(
          'Failed to update region label',
          'Cannot find region label'
        );
      } else {
        this.notificationService.error(
          'Failed to update region label',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Updated region label successfully', '');
    this.regionLabelList[imageTypeIndex][regionLabelIndex] = regionLabel;
    this.refreshAllArray();
  }

  public async onImageTypeRegionLabelColorChanged(
    imageTypeIndex: number,
    regionLabelIndex: number,
    newColor: string
  ): Promise<void> {
    let regionLabel: RegionLabel;
    try {
      regionLabel =
        await this.imageTypeManagementService.updateRegionLabelOfImageType(
          this.imageTypeList[imageTypeIndex].id,
          this.regionLabelList[imageTypeIndex][regionLabelIndex].id,
          this.regionLabelList[imageTypeIndex][regionLabelIndex].displayName,
          newColor
        );
    } catch (e) {
      if (e instanceof InvalidRegionLabelInformationError) {
        this.notificationService.error(
          'Failed to update region label',
          'Invalid region label information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update region label',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update region label',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof RegionLabelNotFoundError) {
        this.notificationService.error(
          'Failed to update region label',
          'Cannot find region label'
        );
      } else {
        this.notificationService.error(
          'Failed to update region label',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Updated region label successfully', '');
    this.regionLabelList[imageTypeIndex][regionLabelIndex] = regionLabel;
    this.refreshAllArray();
  }

  public onImageTypeRegionLabelDeleteClicked(
    imageTypeIndex: number,
    regionLabelIndex: number
  ): void {
    this.modalService.warning({
      nzTitle: 'Delete region label',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOnOk: async () => {
        try {
          await this.imageTypeManagementService.removeRegionLabelFromImageType(
            this.imageTypeList[imageTypeIndex].id,
            this.regionLabelList[imageTypeIndex][regionLabelIndex].id
          );
        } catch (e) {
          if (e instanceof InvalidRegionLabelInformationError) {
            this.notificationService.error(
              'Failed to delete region label',
              'Invalid region label information'
            );
          } else if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to delete region label',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to delete region label',
              "User doesn't have the required permission"
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof RegionLabelNotFoundError) {
            this.notificationService.error(
              'Failed to delete region label',
              'Cannot find region label'
            );
          } else {
            this.notificationService.error(
              'Failed to delete region label',
              'Unknown error'
            );
          }
          return;
        }

        this.notificationService.success(
          'Deleted region label successfully',
          ''
        );
        this.regionLabelList[imageTypeIndex].splice(regionLabelIndex, 1);
        this.refreshAllArray();
      },
    });
  }

  public onImageTypeNewRegionLabelDisplayNameEditingEnd(index: number): void {
    this.isImageTypeCollapsePanelAddingRegionLabelVisible[index] = false;
  }

  public async onImageTypeNewRegionLabelDisplayNameEdited(
    index: number,
    newDisplayName: string
  ): Promise<void> {
    const color = this.randomColorService.getRandomColor();
    let regionLabel: RegionLabel;
    try {
      regionLabel =
        await this.imageTypeManagementService.addRegionLabelToImageType(
          this.imageTypeList[index].id,
          newDisplayName,
          color
        );
    } catch (e) {
      if (e instanceof InvalidRegionLabelInformationError) {
        this.notificationService.error(
          'Failed to create region label',
          'Invalid region label information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to create region label',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to create region label',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof RegionLabelNotFoundError) {
        this.notificationService.error(
          'Failed to create region label',
          'Cannot find image type'
        );
      } else {
        this.notificationService.error(
          'Failed to create region label',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Created region label successfully', '');
    this.regionLabelList[index].push(regionLabel);
    this.refreshAllArray();
  }

  public onNewRegionLabelValueClicked(index: number): void {
    this.imageTypeCollapsePanelAddingRegionLabelDisplayName[index] = '';
    this.isImageTypeCollapsePanelAddingRegionLabelVisible[index] = true;
  }

  public async onImageTypeHasPredictiveModelChanged(
    index: number,
    newHasPredictiveModel: boolean
  ): Promise<void> {
    let imageType: ImageType;
    try {
      imageType = await this.imageTypeManagementService.updateImageType(
        this.imageTypeList[index].id,
        this.imageTypeList[index].displayName,
        newHasPredictiveModel
      );
    } catch (e) {
      if (e instanceof InvalidImageTypeInformationError) {
        this.notificationService.error(
          'Failed to update image type',
          'Invalid image type information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update image type',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update image type',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageTypeNotFoundError) {
        this.notificationService.error(
          'Failed to update image type',
          'Cannot find image type'
        );
      } else {
        this.notificationService.error(
          'Failed to update image type',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Updated image type successfully', '');
    this.imageTypeList[index] = imageType;
    this.refreshAllArray();
  }

  public onDeleteImageTypeClicked(index: number): void {
    this.modalService.warning({
      nzTitle: 'Delete image type',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOnOk: async () => {
        try {
          await this.imageTypeManagementService.deleteImageType(
            this.imageTypeList[index].id
          );
        } catch (e) {
          if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to delete image type',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to delete image type',
              "User doesn't have the required permission"
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof ImageTypeNotFoundError) {
            this.notificationService.error(
              'Failed to delete image type',
              'Cannot find image type'
            );
          } else {
            this.notificationService.error(
              'Failed to delete image type',
              'Unknown error'
            );
          }
          return;
        }

        this.notificationService.success('Deleted image type successfully', '');
        this.imageTypeList.splice(index, 1);
        this.regionLabelList.splice(index, 1);
        this.isImageTypeCollapsePanelOpen.splice(index, 1);
        this.isImageTypeCollapsePanelAddingRegionLabelVisible.splice(index, 1);
        this.imageTypeCollapsePanelAddingRegionLabelDisplayName.splice(
          index,
          1
        );
        this.refreshAllArray();
      },
    });
  }

  public onNewImageTypeDisplayNameEditingEnd(): void {
    this.isNewImageTypePanelVisible = false;
  }

  public async onNewImageTypeDisplayNameEdited(
    newDisplayName: string
  ): Promise<void> {
    let imageType: ImageType;
    try {
      imageType = await this.imageTypeManagementService.createImageType(
        newDisplayName,
        false
      );
    } catch (e) {
      if (e instanceof InvalidImageTypeInformationError) {
        this.notificationService.error(
          'Failed to create image type',
          'Invalid image type information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to create image type',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to create image type',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to create image type',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Created image type successfully', '');
    this.imageTypeList.push(imageType);
    this.regionLabelList.push([]);
    this.isImageTypeCollapsePanelOpen.push(false);
    this.isImageTypeCollapsePanelAddingRegionLabelVisible.push(false);
    this.imageTypeCollapsePanelAddingRegionLabelDisplayName.push('');
    this.refreshAllArray();
  }

  public onNewImageTypeClicked(): void {
    this.newImageTypeDisplayName = '';
    this.isNewImageTypePanelVisible = true;
  }

  private refreshAllArray(): void {
    this.imageTypeList = [...this.imageTypeList];
    this.regionLabelList = [...this.regionLabelList];
    this.isImageTypeCollapsePanelOpen = [...this.isImageTypeCollapsePanelOpen];
    this.isImageTypeCollapsePanelAddingRegionLabelVisible = [
      ...this.isImageTypeCollapsePanelAddingRegionLabelVisible,
    ];
    this.imageTypeCollapsePanelAddingRegionLabelDisplayName = [
      ...this.imageTypeCollapsePanelAddingRegionLabelDisplayName,
    ];
  }
}
