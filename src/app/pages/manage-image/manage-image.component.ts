import { Location } from '@angular/common';
import {
  AfterContentInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  DetectionTaskAlreadyExistsError,
  Image,
  ImageAlreadyHasImageTagError,
  ImageBookmark,
  ImageCannotBeAssignedWithImageTagError,
  ImageDoesNotHaveImageTagError,
  ImageHasUnlabeledRegionError,
  ImageListFilterOptions,
  ImageListSortOption,
  ImageNotFoundError,
  ImageOrImageTagNotFoundError,
  ImageOrImageTypeNotFoundError,
  ImageStatus,
  ImageTag,
  ImageTagGroup,
  ImageType,
  ImageTypesService,
  InvalidImageInformationError,
  InvalidImageStatusError,
  InvalidRegionInformation,
  Region,
  RegionLabel,
  RegionLabelCannotBeAssignedToImageError,
  RegionNotFoundError,
  RegionOperationLog,
  UnauthenticatedError,
  UnauthorizedError,
  UserHasNotBookmarkedImageError,
} from 'src/app/services/dataaccess/api';
import { ImageListManagementService } from 'src/app/services/module/image-list-management';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { ImageStatusService } from 'src/app/services/module/image-management/image-status.service';
import { RegionImageService } from 'src/app/services/module/region-management/region-image.service';
import { RegionManagementService } from 'src/app/services/module/region-management/region-management.service';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';

const DEFAULT_SORT_OPTION = ImageListSortOption.UPLOAD_TIME_DESCENDING;

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss'],
})
export class ManageImageComponent implements OnInit, AfterContentInit {
  @ViewChild('regionSelector', { static: false })
  public regionSelector: RegionSelectorComponent | undefined;
  @ViewChild('descriptionEditableText', { static: false })
  public descriptionEditableText: EditableTextComponent | undefined;
  @ViewChild('imageBookmarkEditableText', { static: false })
  public imageBookmarkEditableText: EditableTextComponent | undefined;
  @ViewChild('contextMenu', { static: false })
  public contextMenu: NzDropdownMenuComponent | undefined;

  private imageID: number | undefined;
  private imageListSortOption: number | undefined;
  private filterOptions: ImageListFilterOptions | undefined;

  public image: Image | undefined;
  public imageTagList: ImageTag[] = [];
  public regionList: Region[] = [];
  public regionLabelList: RegionLabel[] = [];
  public imageBookmark: ImageBookmark | undefined;
  public isImageEditable = true;

  public position: number | undefined;
  public totalImageCount: number | undefined;
  public prevImageID: number | undefined;
  public nextImageID: number | undefined;

  public isCreatingImageBookmark = false;
  public isDeletingImageBookmark = false;

  public isShowingRegionSnapshot = false;
  public regionSnapshotList: Region[] = [];

  public selectedRegionBorder: Polygon | undefined;
  public selectedRegionHoles: Polygon[] = [];

  public isLabelRegionModalVisible = false;

  public isRegionInformationModalVisible = false;
  public regionInformationModalRegion: Region | undefined;
  public regionInformationModalImage: string = '';
  public regionInformationModalOperationLogList: RegionOperationLog[] = [];

  public isImageSettingsModalVisible = false;
  public imageSettingsModalImageTypeList: ImageType[] = [];
  public imageSettingsModalSelectedImageType: ImageType | undefined;

  public contextMenuRegion: Region | undefined;
  public contextMenuRegionID: number | undefined;

  public allowedImageTagGroupListForImageType: ImageTagGroup[] = [];
  public allowedImageTagListForImageType: ImageTag[][] = [];

  private isKeyPressed = false;

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly imageManagementService: ImageManagementService,
    private readonly imageListManagementService: ImageListManagementService,
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
    private readonly jsonCompressService: JSONCompressService
  ) {}

  ngOnInit(): void {
    (async () => {
      try {
        const { imageTypeList } = await this.imageTypesService.getImageTypeList(
          false
        );
        this.imageSettingsModalImageTypeList = imageTypeList;
      } catch (e) {
        this.handleError('Failed to load page', e);
      }
    })().then();
  }

  ngAfterContentInit(): void {
    this.route.params.subscribe(async (params) => {
      this.onParamsChanged(params);
    });
    this.route.queryParams.subscribe(async (params) => {
      this.onQueryParamsChanged(params);
    });
  }

  private async onParamsChanged(params: Params): Promise<void> {
    this.imageID = +params['id'];
    await this.initializePage();
  }

  private async onQueryParamsChanged(queryParams: Params): Promise<void> {
    const filterParam = queryParams['filter'];
    if (filterParam !== undefined) {
      this.filterOptions = this.jsonCompressService.decompress(filterParam);
    } else {
      const authUserInfo =
        await this.sessionManagementService.getUserFromSession();
      if (authUserInfo === null) {
        return;
      }
      this.filterOptions = this.getDefaultFilterOptions(authUserInfo.user.id);
    }

    if (queryParams['sort'] !== undefined) {
      this.imageListSortOption = +queryParams['sort'];
    } else {
      this.imageListSortOption = DEFAULT_SORT_OPTION;
    }

    await this.initializePage();
  }

  private async initializePage(): Promise<void> {
    if (
      this.imageID === undefined ||
      this.imageListSortOption === undefined ||
      this.filterOptions === undefined
    ) {
      return;
    }
    await Promise.all([
      this.loadImage(this.imageID),
      this.loadImagePositionInList(
        this.imageID,
        this.imageListSortOption,
        this.filterOptions
      ),
      this.loadImageBookmark(this.imageID),
    ]);
  }

  private async loadImage(imageID: number): Promise<void> {
    this.image = undefined;
    this.imageTagList = [];
    this.regionList = [];
    this.regionLabelList = [];
    this.allowedImageTagGroupListForImageType = [];
    this.allowedImageTagListForImageType = [];

    try {
      const { image, imageTagList, regionList, canEdit } =
        await this.imageManagementService.getImage(imageID);
      this.image = image;
      this.imageTagList = imageTagList;
      this.regionList = regionList;
      this.isImageEditable = canEdit;

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
      this.handleError('Failed to load image', e);
    }
  }

  private async loadImagePositionInList(
    imageID: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptions
  ): Promise<void> {
    this.position = undefined;
    this.totalImageCount = undefined;
    this.prevImageID = undefined;
    this.nextImageID = undefined;

    try {
      const { position, totalImageCount, prevImageID, nextImageID } =
        await this.imageListManagementService.getImagePositionInList(
          imageID,
          sortOption,
          filterOptions
        );
      this.position = position;
      this.totalImageCount = totalImageCount;
      this.prevImageID = prevImageID;
      this.nextImageID = nextImageID;
    } catch (e) {
      this.handleError('Failed to load image position in list', e);
    }
  }

  private async loadImageBookmark(imageID: number): Promise<void> {
    try {
      this.imageBookmark = await this.imageManagementService.getImageBookmark(
        imageID
      );
    } catch (e) {
      if (e instanceof UserHasNotBookmarkedImageError) {
        this.imageBookmark = undefined;
      } else {
        throw e;
      }
    }
  }

  private getDefaultFilterOptions(
    sessionUserID: number
  ): ImageListFilterOptions {
    const filterOptions = new ImageListFilterOptions();
    filterOptions.uploadedByUserIDList = [sessionUserID];
    return filterOptions;
  }

  @HostListener('document: keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (
      this.isRegionInformationModalVisible ||
      this.isLabelRegionModalVisible ||
      this.isImageSettingsModalVisible
    ) {
      return;
    }
    if (this.descriptionEditableText?.isEditing) {
      return;
    }
    switch (event.code) {
      case 'ArrowLeft':
        if (!this.isKeyPressed) {
          event.preventDefault();
          this.onPreviousClicked();
        }
        break;
      case 'ArrowRight':
        if (!this.isKeyPressed) {
          event.preventDefault();
          this.onNextClicked();
        }
        break;
      case 'KeyZ':
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.shiftKey) {
            this.regionSelector?.redo();
          } else {
            this.regionSelector?.undo();
          }
        }
        break;
      case 'Enter':
        if (event.ctrlKey && this.regionSelector?.isInDrawState()) {
          event.preventDefault();
          this.regionSelector.finishDrawing();
        }
        break;
      case 'Escape':
        if (
          this.regionSelector?.isInDrawState() ||
          this.regionSelector?.isInSelectedState()
        ) {
          this.regionSelector.cancelDrawing();
        }
        break;
      case 'KeyP':
        if (event.ctrlKey && event.shiftKey) {
          event.preventDefault();
          this.onPublishImageClicked();
        }
        break;
    }
    this.isKeyPressed = true;
  }

  @HostListener('document: keyup')
  onKeyUp(): void {
    this.isKeyPressed = false;
  }

  public getImageStatusColor(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusColor(status);
  }

  public getImageStatusString(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusString(status);
  }

  public isImageExcludable(): boolean {
    if (!this.image) {
      return false;
    }
    return this.imageStatusService.isImageExcludable(this.image?.status);
  }

  public isImageExcluded(): boolean {
    if (!this.image) {
      return false;
    }
    return this.imageStatusService.isImageExcluded(this.image?.status);
  }

  public isImagePublished(): boolean {
    if (!this.image) {
      return false;
    }
    return this.imageStatusService.isImagePublished(this.image?.status);
  }

  public isImageVerified(): boolean {
    if (!this.image) {
      return false;
    }
    return this.imageStatusService.isImageVerified(this.image?.status);
  }

  public async onImageTagAdded(addedImageTag: ImageTag): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      await this.imageManagementService.addImageTagToImage(
        this.image.id,
        addedImageTag.id
      );
    } catch (e) {
      this.handleError('Failed to add image tag to image', e);
      return;
    }
    this.notificationService.success(
      'Added image tag to image successfully',
      ''
    );
    this.imageTagList = [...this.imageTagList, addedImageTag];
  }

  public async onImageTagDeleted(deletedImageTag: ImageTag): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      await this.imageManagementService.removeImageTagFromImage(
        this.image.id,
        deletedImageTag.id
      );
    } catch (e) {
      this.handleError('Failed to remove image tag from image', e);
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
      this.handleError('Failed to update image description', e);
      return;
    }
    this.notificationService.success(
      'Updated image description successfully',
      ''
    );
  }

  public async onBookmarkImageClicked(): Promise<void> {
    if (!this.imageID) {
      return;
    }
    try {
      this.imageBookmark =
        await this.imageManagementService.createImageBookmark(this.imageID, '');
    } catch (e) {
      this.handleError('Failed to bookmark image', e);
      return;
    }
    this.notificationService.success('Bookmarked image successfully', '');
  }

  public async onImageBookmarkDescriptionEdited(
    newDescription: string
  ): Promise<void> {
    if (!this.imageID) {
      return;
    }
    try {
      this.imageBookmark =
        await this.imageManagementService.updateImageBookmark(
          this.imageID,
          newDescription
        );
    } catch (e) {
      this.handleError('Failed to update image bookmark', e);
      return;
    }
    this.notificationService.success('Updated image bookmark successfully', '');
  }

  public async onDeleteBookmarkClicked(): Promise<void> {
    if (!this.imageID) {
      return;
    }
    try {
      await this.imageManagementService.deleteImageBookmark(this.imageID);
    } catch (e) {
      this.handleError('Failed to delete image bookmark', e);
      return;
    }
    this.notificationService.success('Deleted image bookmark successfully', '');
    this.imageBookmark = undefined;
  }

  public async onShowRegionSnapshotAtPublishTimeClicked(): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      this.regionSnapshotList =
        await this.imageManagementService.getImageRegionSnapshotList(
          this.image.id,
          ImageStatus.PUBLISHED
        );
      this.isShowingRegionSnapshot = true;
    } catch (e) {
      this.handleError('Failed to get image region snapshot list', e);
      return;
    }
  }

  public async onShowRegionSnapshotAtVerifyTimeClicked(): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      this.regionSnapshotList =
        await this.imageManagementService.getImageRegionSnapshotList(
          this.image.id,
          ImageStatus.VERIFIED
        );
      this.isShowingRegionSnapshot = true;
    } catch (e) {
      this.handleError('Failed to get image region snapshot list', e);
      return;
    }
  }

  public onRestoreCurrentRegionListClicked(): void {
    this.regionSnapshotList = [];
    this.isShowingRegionSnapshot = false;
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
          this.handleError('Failed to exclude image', e);
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
          this.handleError('Failed to include image', e);
          return;
        }
        this.notificationService.success('Included image successfully', '');
      },
    });
  }

  public onPublishImageClicked(): void {
    if (this.isImagePublished()) {
      return;
    }
    this.modalService.create({
      nzTitle: 'Publish this image',
      nzContent:
        'Are you sure? Publishing this image will allow other people to see, label and verify its regions.',
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
          this.handleError('Failed to publish image', e);
          return;
        }
        this.notificationService.success('Published image successfully', '');
      },
    });
  }

  public onUnpublishImageClicked(): void {
    if (!this.isImagePublished() || this.isImageVerified()) {
      return;
    }
    this.modalService.create({
      nzTitle: 'Unpublish this image',
      nzContent:
        'Are you sure? This will take this image back to UPLOADED status, and delete region snapshots of this image at publish time.',
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
          this.handleError('Failed to unpublish image', e);
          return;
        }
        this.notificationService.success('Unpublished image successfully', '');
      },
    });
  }

  public onUnverifyImageClicked(): void {
    if (!this.isImageVerified()) {
      return;
    }
    this.modalService.create({
      nzTitle: 'Unverify this image',
      nzContent:
        'Are you sure? This will take this image back to PUBLISHED status, and delete region snapshots of this image at verify time.',
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
          this.handleError('Failed to unverify image', e);
          return;
        }
        this.notificationService.success('Unverified image successfully', '');
      },
    });
  }

  public onImageSettingsClicked(): void {
    this.isImageSettingsModalVisible = true;
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
      const region = await this.regionManagementService.updateRegionBoundary(
        this.image.id,
        editedRegion.id,
        event.newBorder,
        event.newHoles
      );
      this.regionList = [...this.regionList];
      this.regionList[event.regionID] = region;
    } catch (e) {
      this.handleError('Failed to update region boundary', e);
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
      this.handleError('Failed to add region', e);
    }
  }

  public async onRegionDbClicked(event: RegionClickedEvent): Promise<void> {
    if (event.regionID === null || this.isShowingRegionSnapshot) {
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
    if (!this.image || !this.contextMenu || this.isShowingRegionSnapshot) {
      return;
    }
    if (event.regionID !== null) {
      this.contextMenuRegion = this.regionList[event.regionID];
      this.contextMenuRegionID = event.regionID;
    } else {
      this.contextMenuRegion = undefined;
      this.contextMenuRegionID = undefined;
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

  public onContextMenuEditDrawnRegionClicked(): void {
    if (!this.regionSelector?.isInSelectedState()) {
      return;
    }
    this.regionSelector.editSelectedRegion();
  }

  public onContextMenuEditRegionBoundaryClicked(): void {
    if (this.contextMenuRegionID === undefined) {
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
      this.contextMenuRegionID === undefined
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
      this.handleError('Failed to update region label', e);
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

  public onContextMenuDeleteAllRegionClicked(): void {
    this.modalService.create({
      nzTitle: 'Delete all regions of image',
      nzContent: '<p>Are you sure? This action is <b>IRREVERSIBLE</b>.</p>',
      nzOkDanger: true,
      nzOnOk: async () => {
        if (!this.image) {
          return;
        }
        try {
          await this.regionManagementService.deleteRegionOfImage(this.image.id);
        } catch (e) {
          this.handleError('Failed to delete all regions of image', e);
          return;
        }
        this.notificationService.success(
          'Deleted all regions of image successfully',
          ''
        );
        this.regionList = [];
      },
    });
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

    try {
      this.regionInformationModalOperationLogList =
        await this.regionManagementService.getRegionOperationLogList(
          this.image.id,
          region.id
        );
    } catch (e) {
      this.handleError('Failed to get region operation log list', e);
      return;
    }

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
      this.handleError('Failed to delete region', e);
      return;
    }
    this.notificationService.success('Deleted region successfully', '');
    this.regionList = this.regionList.filter(
      (region) => region.id !== deletedRegion.id
    );
  }

  public onImageSettingsModalClose(): void {
    this.isImageSettingsModalVisible = false;
  }

  public async onImageSettingsModalImageTypeClicked(
    imageType: ImageType
  ): Promise<void> {
    if (!this.image) {
      return;
    }
    this.isImageSettingsModalVisible = false;
    try {
      await this.imageManagementService.updateImageImageType(
        this.image.id,
        imageType.id
      );
    } catch (e) {
      this.handleError('Failed to update image type', e);
      return;
    }
    this.notificationService.success('Updated image type successfully', '');
    await this.loadImage(this.image.id);
  }

  public async onImageSettingsModalRequestDetectionClicked(): Promise<void> {
    if (!this.image) {
      return;
    }
    this.isImageSettingsModalVisible = false;
    try {
      await this.imageManagementService.createImageDetectionTask(this.image.id);
    } catch (e) {
      this.handleError('Failed to request for lesion suggestion', e);
      return;
    }
    this.notificationService.success(
      'Requested for lesion suggestion successfully',
      ''
    );
  }

  public async onImageSettingsModalDeleteImageClicked(): Promise<void> {
    if (!this.image) {
      return;
    }
    this.isImageSettingsModalVisible = false;
    try {
      await this.imageManagementService.deleteImage(this.image.id);
    } catch (e) {
      this.handleError('Failed to delete image', e);
      return;
    }
    this.notificationService.success('Deleted image successfully', '');
    this.location.back();
  }

  public async onPreviousClicked(): Promise<void> {
    if (this.prevImageID === undefined) {
      return;
    }
    this.router.navigate([`/manage-image/${this.prevImageID}`], {
      queryParams: {
        sort: this.imageListSortOption,
        filter: this.jsonCompressService.compress(this.filterOptions),
      },
    });
  }

  public async onNextClicked(): Promise<void> {
    if (this.nextImageID === undefined) {
      return;
    }
    this.router.navigate([`/manage-image/${this.nextImageID}`], {
      queryParams: {
        sort: this.imageListSortOption,
        filter: this.jsonCompressService.compress(this.filterOptions),
      },
    });
  }

  private handleError(notificationTitle: string, e: any): void {
    if (e instanceof UnauthenticatedError) {
      this.notificationService.error(
        notificationTitle,
        'User is not logged in'
      );
      this.router.navigateByUrl('/login');
      return;
    }
    if (e instanceof UnauthorizedError) {
      this.notificationService.error(
        notificationTitle,
        'User does not have the required permission'
      );
      this.router.navigateByUrl('/welcome');
      return;
    }
    if (e instanceof ImageAlreadyHasImageTagError) {
      this.notificationService.error(
        notificationTitle,
        'Image already has image tag'
      );
      return;
    }
    if (e instanceof ImageCannotBeAssignedWithImageTagError) {
      this.notificationService.error(
        notificationTitle,
        'Image of this image type cannot be assigned with image tag'
      );
      return;
    }
    if (e instanceof ImageDoesNotHaveImageTagError) {
      this.notificationService.error(
        notificationTitle,
        'Image does not have image tag'
      );
      return;
    }
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(
        notificationTitle,
        'Image cannot be found'
      );
      this.location.back();
      return;
    }
    if (e instanceof ImageOrImageTagNotFoundError) {
      this.notificationService.error(
        notificationTitle,
        'Image or image tag cannot be found'
      );
      return;
    }
    if (e instanceof ImageOrImageTypeNotFoundError) {
      this.notificationService.error(
        notificationTitle,
        'Image or image type cannot be found'
      );
      return;
    }
    if (e instanceof InvalidImageInformationError) {
      this.notificationService.error(
        notificationTitle,
        'Invalid image information'
      );
      return;
    }
    if (e instanceof InvalidImageStatusError) {
      this.notificationService.error(notificationTitle, 'Invalid image status');
      return;
    }
    if (e instanceof InvalidRegionInformation) {
      this.notificationService.error(
        notificationTitle,
        'Invalid region information'
      );
      return;
    }
    if (e instanceof RegionLabelCannotBeAssignedToImageError) {
      this.notificationService.error(
        notificationTitle,
        'Region label cannot be assigned to image of this image type'
      );
      return;
    }
    if (e instanceof RegionNotFoundError) {
      this.notificationService.error(
        notificationTitle,
        'Region cannot be found'
      );
      return;
    }
    if (e instanceof DetectionTaskAlreadyExistsError) {
      this.notificationService.error(
        notificationTitle,
        'A detection task has already been created for this image'
      );
      return;
    }
    if (e instanceof ImageHasUnlabeledRegionError) {
      this.notificationService.error(
        notificationTitle,
        'Image has at least one unlabeled region'
      );
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
