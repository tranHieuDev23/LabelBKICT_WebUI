import { Location } from '@angular/common';
import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EditableTextComponent } from 'src/app/components/editable-text/editable-text.component';
import { Polygon } from 'src/app/components/region-selector/models';
import {
  RegionClickedEvent,
  RegionEditedEvent,
  RegionSelectedEvent,
} from 'src/app/components/region-selector/region-selector-events';
import { RegionSelectorComponent } from 'src/app/components/region-selector/region-selector.component';
import {
  Image,
  ImageAlreadyHasImageTagError,
  ImageCannotBeAssignedWithImageTagError,
  ImageDoesNotHaveImageTagError,
  ImageListFilterOptions,
  ImageNotFoundError,
  ImageOrImageTagNotFoundError,
  ImageStatus,
  ImageTag,
  ImageTagGroup,
  ImageTypesService,
  InvalidImageInformationError,
  InvalidImageStatusError,
  InvalidRegionInformation,
  Region,
  RegionLabel,
  RegionLabelCannotBeAssignedToImageError,
  RegionNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { ImageStatusService } from 'src/app/services/module/image-management/image-status.service';
import { RegionImageService } from 'src/app/services/module/region-management/region-image.service';
import { RegionManagementService } from 'src/app/services/module/region-management/region-management.service';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss'],
})
export class ManageImageComponent implements AfterContentInit {
  @ViewChild('regionSelector', { static: false })
  public regionSelector: RegionSelectorComponent | undefined;
  @ViewChild('descriptionEditableText', { static: false })
  public descriptionEditableText: EditableTextComponent | undefined;
  @ViewChild('contextMenu', { static: false })
  public contextMenu: NzDropdownMenuComponent | undefined;

  public image: Image | undefined;
  public imageTagList: ImageTag[] = [];
  public regionList: Region[] = [];
  public regionLabelList: RegionLabel[] = [];
  public editable = true;

  private filterOptions: ImageListFilterOptions | undefined;

  public selectedRegionBorder: Polygon | undefined;
  public selectedRegionHoles: Polygon[] = [];

  public isLabelRegionModalVisible = false;

  public isRegionInformationModalVisible = false;
  public regionInformationModalRegion: Region | null = null;
  public regionInformationModalImage: string = '';

  public contextMenuRegion: Region | null = null;
  public contextMenuRegionID: number | null = null;

  public allowedImageTagGroupListForImageType: ImageTagGroup[] = [];
  public allowedImageTagListForImageType: ImageTag[][] = [];

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly imageManagementService: ImageManagementService,
    private readonly regionManagementService: RegionManagementService,
    private readonly imageTypesService: ImageTypesService,
    private readonly imageStatusService: ImageStatusService,
    private readonly regionImageService: RegionImageService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly modalService: NzModalService,
    private readonly contextMenuService: NzContextMenuService,
    private readonly jsonCompress: JSONCompressService
  ) {}

  ngAfterContentInit(): void {
    this.route.params.subscribe(async (params) => {
      this.onParamsChanged(params);
    });
    this.route.queryParams.subscribe(async (params) => {
      this.onQueryParamsChanged(params);
    });
  }

  private async onParamsChanged(params: Params): Promise<void> {
    const imageID = +params['id'];
    await this.loadImage(imageID);
  }

  private async loadImage(imageID: number): Promise<void> {
    try {
      const { image, imageTagList, regionList } =
        await this.imageManagementService.getImage(imageID);
      this.image = image;
      this.imageTagList = imageTagList;
      this.regionList = regionList;

      if (image.imageType) {
        const { regionLabelList } = await this.imageTypesService.getImageType(
          image.imageType.id
        );
        this.regionLabelList = regionLabelList;

        const { imageTagGroupList, imageTagList } =
          await this.imageTypesService.getImageTagGroupListOfImageType(
            image.imageType.id
          );
        this.allowedImageTagGroupListForImageType = imageTagGroupList;
        this.allowedImageTagListForImageType = imageTagList;
      } else {
        this.regionLabelList = [];
        this.allowedImageTagGroupListForImageType = [];
        this.allowedImageTagListForImageType = [];
      }

      window.scrollTo(0, 0);
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to load image',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to load image',
          'User does not have the required permission'
        );
        this.location.back();
      } else if (e instanceof ImageNotFoundError) {
        this.notificationService.error(
          'Failed to load image',
          'Image not found'
        );
        this.location.back();
      }
    }
  }

  private async onQueryParamsChanged(queryParams: Params): Promise<void> {
    const filterParam = queryParams['filter'];
    if (filterParam !== undefined) {
      this.filterOptions = this.jsonCompress.decompress(filterParam);
    } else {
      const authUserInfo =
        await this.sessionManagementService.getUserFromSession();
      if (authUserInfo === null) {
        return;
      }
      this.filterOptions = this.getDefaultFilterOptions(authUserInfo.user.id);
    }
  }

  private getDefaultFilterOptions(
    sessionUserID: number
  ): ImageListFilterOptions {
    const filterOptions = new ImageListFilterOptions();
    filterOptions.uploadedByUserIDList = [sessionUserID];
    return filterOptions;
  }

  public getImageStatusColor(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusColor(status);
  }

  public getImageStatusString(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusString(status);
  }

  public isImagePublishable(): boolean {
    if (this.image?.status !== ImageStatus.UPLOADED) {
      return false;
    }
    if (this.regionList.length === 0) {
      return false;
    }
    const unlabeledCount = this.regionList.filter(
      (region) => region.label === null
    ).length;
    return unlabeledCount === 0;
  }

  public isImagePublished(): boolean {
    return (
      this.image?.status === ImageStatus.PUBLISHED ||
      this.image?.status === ImageStatus.VERIFIED
    );
  }

  public isImageExcludable(): boolean {
    return this.image?.status === ImageStatus.UPLOADED;
  }

  public isImageExcluded(): boolean {
    return this.image?.status === ImageStatus.EXCLUDED;
  }

  public async onImageTagForUploadedImageAdded(
    addedImageTag: ImageTag
  ): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      await this.imageManagementService.addImageTagToImage(
        this.image.id,
        addedImageTag.id
      );
    } catch (e) {
      if (e instanceof ImageCannotBeAssignedWithImageTagError) {
        this.notificationService.error(
          'Failed to add image tag to image',
          'This image tag is not allowed for this image type'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to add image tag to image',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to add image tag to image',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageOrImageTagNotFoundError) {
        this.notificationService.error(
          'Failed to add image tag to image',
          'Image or image tag cannot be found'
        );
      } else if (e instanceof ImageAlreadyHasImageTagError) {
        this.notificationService.error(
          'Failed to add image tag to image',
          'Image already has image tag'
        );
      } else {
        this.notificationService.error(
          'Failed to add image tag to image',
          'Unknown error'
        );
      }
      return;
    }
    this.notificationService.success(
      'Added image tag to image successfully',
      ''
    );
    this.imageTagList = [...this.imageTagList, addedImageTag];
  }

  public async onImageTagForUploadedImageDeleted(
    deletedImageTag: ImageTag
  ): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      await this.imageManagementService.removeImageTagFromImage(
        this.image.id,
        deletedImageTag.id
      );
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to remove image tag from image',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to remove image tag from image',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageOrImageTagNotFoundError) {
        this.notificationService.error(
          'Failed to remove image tag from image',
          'Image or image tag cannot be found'
        );
      } else if (e instanceof ImageDoesNotHaveImageTagError) {
        this.notificationService.error(
          'Failed to remove image tag from image',
          'Image does not have image tag'
        );
      } else {
        this.notificationService.error(
          'Failed to remove image tag from image',
          'Unknown error'
        );
      }
      return;
    }
    this.notificationService.success(
      'Removed image tag from image successfully',
      ''
    );
    this.imageTagList = this.imageTagList.filter(
      (imageTag) => imageTag.id !== deletedImageTag.id
    );
  }

  public async onImageDescriptionUpdated(description: string): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      this.image = await this.imageManagementService.updateImageMetadata(
        this.image.id,
        description
      );
    } catch (e) {
      if (e instanceof InvalidImageInformationError) {
        this.notificationService.error(
          'Failed to update image description',
          'Invalid description'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update image description',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update image description',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageNotFoundError) {
        this.notificationService.error(
          'Failed to update image description',
          'Image cannot be found'
        );
        this.location.back();
      } else {
        this.notificationService.error(
          'Failed to update image description',
          'Unknown error'
        );
      }
      return;
    }
    this.notificationService.success(
      'Updated image description successfully',
      ''
    );
  }

  public onExcludeImageClicked(): void {
    this.modalService.create({
      nzTitle: 'Exclude this image from labeling',
      nzContent:
        '<p>Are you sure? Excluded images are not shown to other users, ' +
        'except for those with Manage All Image privilege. Use this if you ' +
        'only want to keep this image on the system for managing, not for ' +
        'labeling image data.</p><p>You can undo this action later.</p>',
      nzOnOk: async () => {
        if (!this.image) {
          return;
        }
        try {
          this.image = await this.imageManagementService.updateImageStatus(
            this.image.id,
            ImageStatus.EXCLUDED
          );
        } catch (e) {
          if (e instanceof InvalidImageStatusError) {
            this.notificationService.error(
              'Failed to exclude image',
              'Invalid image status transition'
            );
          } else if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to exclude image',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to exclude image',
              'User does not have the required permission'
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof ImageNotFoundError) {
            this.notificationService.error(
              'Failed to exclude image',
              'Image cannot be found'
            );
            this.location.back();
          } else {
            this.notificationService.error(
              'Failed to exclude image',
              'Unknown error'
            );
          }
          return;
        }
        this.notificationService.success('Excluded image successfully', '');
      },
    });
  }

  public onIncludeImageClicked(): void {
    this.modalService.create({
      nzTitle: 'Include this image for labeling',
      nzContent:
        '<p>Are you sure? Included images can be published to show to other users ' +
        'for verification. Use this if you want to keep this image on the system for ' +
        'labeling image data.</p><p>You can undo this action later.</p>',
      nzOnOk: async () => {
        if (!this.image) {
          return;
        }
        try {
          this.image = await this.imageManagementService.updateImageStatus(
            this.image.id,
            ImageStatus.UPLOADED
          );
        } catch (e) {
          if (e instanceof InvalidImageStatusError) {
            this.notificationService.error(
              'Failed to include image',
              'Invalid image status transition'
            );
          } else if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to include image',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to include image',
              'User does not have the required permission'
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof ImageNotFoundError) {
            this.notificationService.error(
              'Failed to include image',
              'Image cannot be found'
            );
            this.location.back();
          } else {
            this.notificationService.error(
              'Failed to include image',
              'Unknown error'
            );
          }
          return;
        }
        this.notificationService.success('Included image successfully', '');
      },
    });
  }

  public onPublishImageClicked(): void {
    this.modalService.create({
      nzTitle: 'Include this image for labeling',
      nzContent:
        'Are you sure? Publishing this image will allow other people to see, ' +
        'label and verify its regions. This action is <b>IRREVERSIBLE</b>.',
      nzOnOk: async () => {
        if (!this.image) {
          return;
        }
        try {
          this.image = await this.imageManagementService.updateImageStatus(
            this.image.id,
            ImageStatus.PUBLISHED
          );
        } catch (e) {
          if (e instanceof InvalidImageStatusError) {
            this.notificationService.error(
              'Failed to publish image',
              'Invalid image status transition'
            );
          } else if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to publish image',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to publish image',
              'User does not have the required permission'
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof ImageNotFoundError) {
            this.notificationService.error(
              'Failed to publish image',
              'Image cannot be found'
            );
            this.location.back();
          } else {
            this.notificationService.error(
              'Failed to publish image',
              'Unknown error'
            );
          }
          return;
        }
        this.notificationService.success('Published image successfully', '');
      },
    });
  }

  public onRegionSelected(event: RegionSelectedEvent): void {
    this.selectedRegionBorder = event.border;
    this.selectedRegionHoles = event.holes;
    this.isLabelRegionModalVisible = true;
  }

  public async onRegionEdited(event: RegionEditedEvent): Promise<void> {
    if (!this.image) {
      return;
    }
    this.regionSelector?.cancelDrawing();
    const editedRegion = this.regionList[event.regionID];
    try {
      const border = event.newHoles[0];
      const holes = event.newHoles.slice(1);
      const region = await this.regionManagementService.updateRegionBoundary(
        this.image.id,
        editedRegion.id,
        border,
        holes
      );
      this.regionList = [...this.regionList];
      this.regionList[event.regionID] = region;
    } catch (e) {
      if (e instanceof InvalidRegionInformation) {
        this.notificationService.error(
          'Failed to update region boundary',
          'Invalid region information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update region boundary',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update region boundary',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof RegionNotFoundError) {
        this.notificationService.error(
          'Failed to update region boundary',
          'Region not found'
        );
      } else {
        this.notificationService.error(
          'Failed to update region boundary',
          'Unknown error'
        );
      }
      return;
    }
    this.notificationService.success(
      'Updated region boundary successfully',
      ''
    );
  }

  public onCloseLabelRegionModal(): void {
    this.isLabelRegionModalVisible = false;
  }

  public async onLabelRegionModalItemClicked(
    regionLabel: RegionLabel
  ): Promise<void> {
    await this.addSelectedRegion(regionLabel);
    this.isLabelRegionModalVisible = false;
  }

  public async addSelectedRegion(regionLabel: RegionLabel): Promise<void> {
    if (!this.image || !this.selectedRegionBorder) {
      return;
    }
    try {
      const region = await this.regionManagementService.createRegion(
        this.image.id,
        this.selectedRegionBorder,
        this.selectedRegionHoles,
        regionLabel.id
      );
      this.notificationService.success('Region added successfully', '');
      this.regionList = [...this.regionList, region];
      this.selectedRegionBorder = undefined;
      this.selectedRegionHoles = [];
      this.regionSelector?.cancelDrawing();
    } catch (e) {
      if (e instanceof InvalidRegionInformation) {
        this.notificationService.error(
          'Failed to add region',
          'Invalid region information'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to add region',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to add region',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof ImageNotFoundError) {
        this.notificationService.error(
          'Failed to add region',
          'Image not found'
        );
        this.location.back();
      } else if (e instanceof RegionLabelCannotBeAssignedToImageError) {
        this.notificationService.error(
          'Failed to add region',
          'Region label cannot be assigned to image of this image type'
        );
      } else {
        this.notificationService.error('Failed to add region', 'Unknown error');
      }
    }
  }

  public async onRegionDbClicked(event: RegionClickedEvent): Promise<void> {
    if (event.regionID === null) {
      return;
    }
    const region = this.regionList[event.regionID];
    await this.openRegionInfoModal(region);
  }

  public async onRegionInformationModalDeleteRegionClicked(): Promise<void> {
    if (!this.image || !this.regionInformationModalRegion) {
      return;
    }
    await this.handleDeleteRegion(this.regionInformationModalRegion);
    this.isRegionInformationModalVisible = false;
  }

  public onRegionInformationModalClose(): void {
    this.isRegionInformationModalVisible = false;
  }

  public async onContextMenu(event: RegionClickedEvent): Promise<void> {
    if (!this.image || !this.contextMenu) {
      return;
    }
    if (event.regionID !== null) {
      this.contextMenuRegion = this.regionList[event.regionID];
      this.contextMenuRegionID = event.regionID;
    } else {
      this.contextMenuRegion = null;
      this.contextMenuRegionID = null;
    }
    this.contextMenuService.create(event.event, this.contextMenu);
  }

  public isRegionListVisible(): boolean {
    return this.regionSelector?.isRegionListVisible() || false;
  }

  public onContextMenuResetZoomClicked(): void {
    this.regionSelector?.resetZoom();
  }

  public onContextMenuHideRegionsClicked(): void {
    this.regionSelector?.hideRegionList();
  }

  public onContextMenuShowRegionsClicked(): void {
    this.regionSelector?.showRegionList();
  }

  public isRegionSelectorIsInDrawState(): boolean {
    return this.regionSelector?.isInDrawState() || false;
  }

  public isRegionSelectorIsInSelectedState(): boolean {
    return this.regionSelector?.isInSelectedState() || false;
  }

  public onContextMenuEditRegionBoundaryClicked(): void {
    if (this.contextMenuRegionID === null) {
      return;
    }
    this.regionSelector?.editRegion(this.contextMenuRegionID);
  }

  public async onContextMenuRelabelRegionLabelClicked(
    regionLabel: RegionLabel
  ): Promise<void> {
    if (
      !this.image ||
      !this.contextMenuRegion ||
      this.contextMenuRegionID === null
    ) {
      return;
    }
    try {
      const updatedRegion =
        await this.regionManagementService.updateRegionRegionLabel(
          this.image.id,
          this.contextMenuRegion.id,
          regionLabel.id
        );
      this.regionList = [...this.regionList];
      this.regionList[this.contextMenuRegionID] = updatedRegion;
      this.notificationService.success('Updated region label successfully', '');
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update region label',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update region label',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof RegionNotFoundError) {
        this.notificationService.error(
          'Failed to update region label',
          'Region not found'
        );
      } else if (e instanceof RegionLabelCannotBeAssignedToImageError) {
        this.notificationService.error(
          'Failed to update region label',
          'Region label cannot be assigned to image of this image type'
        );
      } else {
        this.notificationService.error(
          'Failed to update region label',
          'Unknown error'
        );
      }
      return;
    }
  }

  public async onContextMenuShowRegionInfoClicked(): Promise<void> {
    if (!this.contextMenuRegion) {
      return;
    }
    await this.openRegionInfoModal(this.contextMenuRegion);
  }

  public async onContextMenuDeleteRegionClicked(): Promise<void> {
    if (!this.contextMenuRegion) {
      return;
    }
    await this.handleDeleteRegion(this.contextMenuRegion);
  }

  private async openRegionInfoModal(region: Region): Promise<void> {
    if (!this.image) {
      return;
    }
    this.regionInformationModalImage =
      await this.regionImageService.generateRegionImage(
        this.image.originalImageURL,
        region.border
      );
    this.regionInformationModalRegion = region;
    this.isRegionInformationModalVisible = true;
  }

  private async handleDeleteRegion(deletedRegion: Region): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      await this.regionManagementService.deleteRegion(
        this.image.id,
        deletedRegion.id
      );
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to delete region',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to delete region',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof RegionNotFoundError) {
        this.notificationService.error(
          'Failed to delete region',
          'Region not found'
        );
      } else {
        this.notificationService.error(
          'Failed to delete region',
          'Unknown error'
        );
      }
      return;
    }
    this.notificationService.success('Deleted region successfully', '');
    this.regionList = this.regionList.filter(
      (region) => region.id !== deletedRegion.id
    );
  }
}
