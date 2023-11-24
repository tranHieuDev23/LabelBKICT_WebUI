import { Location } from '@angular/common';
import { AfterContentInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Params, Router } from '@angular/router';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { EditableTextComponent } from 'src/app/components/editable-text/editable-text.component';
import { Coordinate, Rectangle, Shape } from 'src/app/components/region-selector/models';
import {
  RegionSelectorClickedEvent,
  RegionEditedEvent,
  RegionSelectedEvent,
} from 'src/app/components/region-selector/region-selector-events';
import { RegionSelectorComponent } from 'src/app/components/region-selector/region-selector.component';
import {
  Image,
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
  InvalidImageInformationError,
  InvalidImageStatusError,
  InvalidRegionInformation,
  PointOfInterest,
  Region,
  RegionLabel,
  RegionLabelCannotBeAssignedToImageError,
  RegionNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
  UserHasNotBookmarkedImageError,
} from 'src/app/services/dataaccess/api';
import { ImageListManagementService } from 'src/app/services/module/image-list-management';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { ImageStatusService } from 'src/app/services/module/image-management/image-status.service';
import { ImageTypeManagementService } from 'src/app/services/module/image-type-management';
import { RegionManagementService } from 'src/app/services/module/region-management/region-management.service';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';
import store from 'store2';
import saveAs from 'file-saver';
import { AddPoiModalComponent } from './add-poi-modal/add-poi-modal.component';
import { UpdatePoiModalComponent } from './update-poi-modal/update-poi-modal.component';
import { RegionSelectorElement } from 'src/app/components/region-selector/common/constants';
import { RegionInformationComponent } from './region-information/region-information.component';
import { ManageableUserListComponent } from './manageable-user-list/manageable-user-list.component';
import { VerifiableUserListComponent } from './verifiable-user-list/verifiable-user-list.component';
import { ImageSettingsModalComponent } from './image-settings-modal/image-settings-modal.component';
import { MassDeleteRegionModalComponent } from './mass-delete-region-modal/mass-delete-region-modal.component';
import { AddManageableUserModalComponent } from './add-manageable-user-modal/add-manageable-user-modal.component';
import { AddVerifiableUserModalComponent } from './add-verifiable-user-modal/add-verifiable-user-modal.component';
import { LabelRegionModalComponent } from './label-region-modal/label-region-modal.component';

const DEFAULT_SORT_OPTION = ImageListSortOption.UPLOAD_TIME_DESCENDING;
const MANAGE_IMAGE_DRAW_MARGINS_ENABLED_KEY = 'MANAGE_IMAGE_DRAW_MARGINS_ENABLED_KEY';
const MANAGE_IMAGE_SYMMETRICAL_VERTICAL_DRAW_MARGINS_ENABLED_KEY =
  'MANAGE_IMAGE_SYMMETRICAL_VERTICAL_DRAW_MARGINS_ENABLED_KEY';
const MANAGE_IMAGE_SYMMETRICAL_HORIZONTAL_DRAW_MARGINS_ENABLED_KEY =
  'MANAGE_IMAGE_SYMMETRICAL_HORIZONTAL_DRAW_MARGINS_ENABLED_KEY';
const MANAGE_IMAGE_DRAW_MARGINS_LEFT_KEY = 'MANAGE_IMAGE_DRAW_MARGINS_LEFT_KEY';
const MANAGE_IMAGE_DRAW_MARGINS_RIGHT_KEY = 'MANAGE_IMAGE_DRAW_MARGINS_RIGHT_KEY';
const MANAGE_IMAGE_DRAW_MARGINS_BOTTOM_KEY = 'MANAGE_IMAGE_DRAW_MARGINS_BOTTOM_KEY';
const MANAGE_IMAGE_DRAW_MARGINS_TOP_KEY = 'MANAGE_IMAGE_DRAW_MARGINS_TOP_KEY';
const MANAGE_IMAGE_DRAW_BOUNDARY_ENABLED_KEY = 'MANAGE_IMAGE_DRAW_BOUNDARY_ENABLED_KEY';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss'],
})
export class ManageImageComponent implements OnInit, AfterContentInit, OnDestroy {
  @ViewChild('regionSelector', { static: false })
  public regionSelector: RegionSelectorComponent | undefined;
  @ViewChild('descriptionEditableText', { static: false })
  public descriptionEditableText: EditableTextComponent | undefined;
  @ViewChild('imageBookmarkEditableText', { static: false })
  public imageBookmarkEditableText: EditableTextComponent | undefined;
  @ViewChild('contextMenu', { static: false })
  public contextMenu: NzDropdownMenuComponent | undefined;
  @ViewChild('manageableUserList', { static: false })
  public manageableUserList: ManageableUserListComponent | undefined;
  @ViewChild('verifiableUserList', { static: false })
  public verifiableUserList: VerifiableUserListComponent | undefined;
  @ViewChild('labelRegionModal', { static: false })
  public labelRegionModal: LabelRegionModalComponent | undefined;
  @ViewChild('regionInformationModal', { static: false })
  public regionInformationModal: RegionInformationComponent | undefined;
  @ViewChild('massDeleteRegionModal', { static: false })
  public massDeleteRegionModal: MassDeleteRegionModalComponent | undefined;
  @ViewChild('addPoiModal', { static: false })
  public addPoiModal: AddPoiModalComponent | undefined;
  @ViewChild('updatePoiModal', { static: false })
  public updatePoiModal: UpdatePoiModalComponent | undefined;
  @ViewChild('imageSettingsModal', { static: false })
  public imageSettingsModal: ImageSettingsModalComponent | undefined;
  @ViewChild('addManageableUserModal', { static: false })
  public addManageableUserModal: AddManageableUserModalComponent | undefined;
  @ViewChild('addVerifiableUserModal', { static: false })
  public addVerifiableUserModal: AddVerifiableUserModalComponent | undefined;

  private imageID: number | undefined;
  private imageListSortOption: number | undefined;
  private filterOptions: ImageListFilterOptions | undefined;

  public image: Image | undefined;
  public imageTagList: ImageTag[] = [];
  public pointOfInterestList: PointOfInterest[] = [];
  public regionList: Region[] = [];
  public regionLabelList: RegionLabel[] = [];
  public imageBookmark: ImageBookmark | undefined;
  public isImageEditable = true;
  public isImageVerifiable = true;

  public position: number | undefined;
  public totalImageCount: number | undefined;
  public prevImageID: number | undefined;
  public nextImageID: number | undefined;

  public isCreatingImageBookmark = false;
  public isDeletingImageBookmark = false;

  public userHasImageExportPermission = false;

  public isShowingRegionSnapshot = false;
  public regionSnapshotList: Region[] = [];

  public selectedRegionBorder: Shape | undefined;
  public selectedRegionHoleList: Shape[] = [];
  public isAddingSelectedRegion = false;

  public contextMenuRegionID: number | undefined;
  public contextMenuPointOfInterestID: number | undefined;
  public contextMenuMouseImagePos: Coordinate | undefined;

  public allowedImageTagGroupListForImageType: ImageTagGroup[] = [];
  public allowedImageTagListForImageType: ImageTag[][] = [];

  private routerSubscription: Subscription;
  private isKeyPressed = false;

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly imageManagementService: ImageManagementService,
    private readonly imageListManagementService: ImageListManagementService,
    private readonly regionManagementService: RegionManagementService,
    private readonly imageTypeManagementService: ImageTypeManagementService,
    private readonly imageStatusService: ImageStatusService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly modalService: NzModalService,
    private readonly contextMenuService: NzContextMenuService,
    private readonly jsonCompressService: JSONCompressService
  ) {
    this.routerSubscription = router.events.subscribe((event) => {
      this.onRouterEvent(event);
    });
  }

  ngOnInit(): void {
    this.userHasImageExportPermission = this.sessionManagementService.checkSessionUserHasPermission('images.export');
  }

  ngAfterContentInit(): void {
    this.route.params.subscribe(async (params) => {
      this.onParamsChanged(params);
    });
    this.route.queryParams.subscribe(async (params) => {
      this.onQueryParamsChanged(params);
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
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
      const authUserInfo = await this.sessionManagementService.getUserFromSession();
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
    if (this.imageID === undefined || this.imageListSortOption === undefined || this.filterOptions === undefined) {
      return;
    }
    await Promise.all([
      this.loadImage(this.imageID),
      this.loadImagePositionInList(this.imageID, this.imageListSortOption, this.filterOptions),
      this.loadImageBookmark(this.imageID),
    ]);
    this.loadImageMargins();
    this.loadImageBoundary();
    this.onContextMenuCenterDrawBoundaryInDrawMarginsClicked();
  }

  private async loadImage(imageID: number): Promise<void> {
    this.image = undefined;
    this.imageTagList = [];
    this.regionList = [];
    this.regionLabelList = [];
    this.allowedImageTagGroupListForImageType = [];
    this.allowedImageTagListForImageType = [];

    try {
      const { image, imageTagList, regionList, pointOfInterestList, canEdit, canVerify } =
        await this.imageManagementService.getImage(imageID);
      this.image = image;
      this.imageTagList = imageTagList;
      this.regionList = regionList;
      this.pointOfInterestList = pointOfInterestList;
      this.isImageEditable = canEdit;
      this.isImageVerifiable = canVerify;

      if (image.imageType) {
        const { regionLabelList } = await this.imageTypeManagementService.getImageType(image.imageType.id);
        this.regionLabelList = regionLabelList;

        const { imageTagGroupList, imageTagList } =
          await this.imageTypeManagementService.getImageTagGroupListOfImageType(image.imageType.id);
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
        await this.imageListManagementService.getImagePositionInUserManageableImageList(
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
      this.imageBookmark = await this.imageManagementService.getImageBookmark(imageID);
    } catch (e) {
      if (e instanceof UserHasNotBookmarkedImageError) {
        this.imageBookmark = undefined;
      } else {
        throw e;
      }
    }
  }

  private loadImageMargins(): void {
    const enabled = store.get(MANAGE_IMAGE_DRAW_MARGINS_ENABLED_KEY) || true;
    const symmetricalVertical = store.get(MANAGE_IMAGE_SYMMETRICAL_VERTICAL_DRAW_MARGINS_ENABLED_KEY) || false;
    const symmetricalHorizontal = store.get(MANAGE_IMAGE_SYMMETRICAL_HORIZONTAL_DRAW_MARGINS_ENABLED_KEY) || false;
    const left = +(store.get(MANAGE_IMAGE_DRAW_MARGINS_LEFT_KEY) || 0);
    const right = +(store.get(MANAGE_IMAGE_DRAW_MARGINS_RIGHT_KEY) || 1);
    const bottom = +(store.get(MANAGE_IMAGE_DRAW_MARGINS_BOTTOM_KEY) || 0);
    const top = +(store.get(MANAGE_IMAGE_DRAW_MARGINS_TOP_KEY) || 1);

    if (enabled) {
      this.regionSelector?.showDrawMargins();
    } else {
      this.regionSelector?.hideDrawMargins();
    }
    this.regionSelector?.setDrawMargins(new Rectangle(left, right, bottom, top));
    this.onVerticalDrawMarginsSymmetricalUpdate(symmetricalVertical);
    this.onHorizontalDrawMarginsSymmetricalUpdate(symmetricalHorizontal);
  }

  private loadImageBoundary(): void {
    const enabled = store.get(MANAGE_IMAGE_DRAW_BOUNDARY_ENABLED_KEY) || false;
    if (enabled) {
      this.regionSelector?.showDrawBoundary();
    } else {
      this.regionSelector?.hideDrawBoundary();
    }
  }

  private getDefaultFilterOptions(sessionUserID: number): ImageListFilterOptions {
    const filterOptions = new ImageListFilterOptions();
    filterOptions.uploadedByUserIDList = [sessionUserID];
    return filterOptions;
  }

  private isModalVisible(): boolean {
    return (
      this.regionInformationModal?.visible ||
      this.labelRegionModal?.visible ||
      this.imageSettingsModal?.visible ||
      this.massDeleteRegionModal?.visible ||
      this.addPoiModal?.visible ||
      this.updatePoiModal?.visible ||
      this.addManageableUserModal?.visible ||
      this.addVerifiableUserModal?.visible ||
      false
    );
  }

  @HostListener('document: keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (this.isModalVisible()) {
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
        if (event.ctrlKey && this.regionSelector?.isEditing()) {
          event.preventDefault();
          this.regionSelector.finishDrawing();
        }
        break;
      case 'Escape':
        if (this.regionSelector?.isEditing() || this.regionSelector?.isInSelectedState()) {
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
      await this.imageManagementService.addImageTagToImage(this.image.id, addedImageTag.id);
    } catch (e) {
      this.handleError('Failed to add image tag to image', e);
      return;
    }
    this.notificationService.success('Added image tag to image successfully', '');
    this.imageTagList = [...this.imageTagList, addedImageTag];
  }

  public async onImageTagDeleted(deletedImageTag: ImageTag): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      await this.imageManagementService.removeImageTagFromImage(this.image.id, deletedImageTag.id);
    } catch (e) {
      this.handleError('Failed to remove image tag from image', e);
      return;
    }
    this.notificationService.success('Removed image tag from image successfully', '');
    this.imageTagList = this.imageTagList.filter((imageTag) => imageTag.id !== deletedImageTag.id);
  }

  public async onImageDescriptionUpdated(description: string): Promise<void> {
    if (!this.image) {
      return;
    }
    try {
      this.image = await this.imageManagementService.updateImageMetadata(this.image.id, description);
    } catch (e) {
      this.handleError('Failed to update image description', e);
      return;
    }
    this.notificationService.success('Updated image description successfully', '');
  }

  public async onBookmarkImageClicked(): Promise<void> {
    if (!this.imageID) {
      return;
    }
    try {
      this.imageBookmark = await this.imageManagementService.createImageBookmark(this.imageID, '');
    } catch (e) {
      this.handleError('Failed to bookmark image', e);
      return;
    }
    this.notificationService.success('Bookmarked image successfully', '');
  }

  public async onImageBookmarkDescriptionEdited(newDescription: string): Promise<void> {
    if (!this.imageID) {
      return;
    }
    try {
      this.imageBookmark = await this.imageManagementService.updateImageBookmark(this.imageID, newDescription);
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
      this.regionSnapshotList = await this.imageManagementService.getImageRegionSnapshotList(
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
      this.regionSnapshotList = await this.imageManagementService.getImageRegionSnapshotList(
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

  public onMassDeleteRegionsClicked(): void {
    if (!this.image) {
      return;
    }
    this.massDeleteRegionModal?.open(this.image, this.regionList);
  }

  public onMassRegionDeleted(deletedRegionList: Region[]): void {
    const deletedRegionIDSet = new Set(deletedRegionList.map((item) => item.id));
    this.regionList = this.regionList.filter((item) => !deletedRegionIDSet.has(item.id));
  }

  public onDeleteAllRegionsClicked(): void {
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
        this.notificationService.success('Deleted all regions of image successfully', '');
        this.regionList = [];
      },
    });
  }

  public async onDownloadImageOnlyClicked(): Promise<void> {
    if (!this.image) {
      return;
    }

    const fileName = `${this.image.id}.jpeg`;
    saveAs(this.image.originalImageURL, fileName);
  }

  public async onDownloadImageWithRegionsClicked(): Promise<void> {
    if (!this.image) {
      return;
    }

    const imageWithRegionsData = await this.imageManagementService.generateImageWithRegions(
      this.image,
      this.regionList
    );
    const fileName = `${this.image.id}-with-regions.jpeg`;
    saveAs(imageWithRegionsData, fileName);
  }

  public async onManageableUsersPanelActiveChange(isActive: boolean): Promise<void> {
    if (!this.imageID || !isActive) {
      return;
    }

    await this.manageableUserList?.load(this.imageID);
  }

  public onManageableUserPanelAddUserClicked(): void {
    if (!this.image) {
      return;
    }
    this.addManageableUserModal?.open(this.image.id);
  }

  public async onManageableUserAdded(): Promise<void> {
    if (!this.image) {
      return;
    }
    await this.manageableUserList?.load(this.image.id);
  }

  public async onVerifiableUsersPanelActiveChange(isActive: boolean): Promise<void> {
    if (!this.image || !isActive) {
      return;
    }
    await this.verifiableUserList?.load(this.image.id);
  }

  public onVerifiableUserPanelAddUserClicked(): void {
    if (!this.image) {
      return;
    }
    this.addVerifiableUserModal?.open(this.image.id);
  }

  public async onVerifiableUserAdded(): Promise<void> {
    if (!this.image) {
      return;
    }
    await this.verifiableUserList?.load(this.image.id);
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
          this.image = await this.imageManagementService.updateImageStatus(this.image.id, ImageStatus.EXCLUDED);
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
          this.image = await this.imageManagementService.updateImageStatus(this.image.id, ImageStatus.UPLOADED);
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
      nzContent: 'Are you sure? Publishing this image will allow other people to see, label and verify its regions.',
      nzOnOk: async () => {
        if (!this.image) {
          return;
        }
        try {
          this.image = await this.imageManagementService.updateImageStatus(this.image.id, ImageStatus.PUBLISHED);
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
          this.image = await this.imageManagementService.updateImageStatus(this.image.id, ImageStatus.UPLOADED);
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
          this.image = await this.imageManagementService.updateImageStatus(this.image.id, ImageStatus.PUBLISHED);
        } catch (e) {
          this.handleError('Failed to unverify image', e);
          return;
        }
        this.notificationService.success('Unverified image successfully', '');
      },
    });
  }

  public onImageSettingsClicked(): void {
    if (!this.image) {
      return;
    }

    this.imageSettingsModal?.open(this.image);
  }

  public onRegionSelected(event: RegionSelectedEvent): void {
    if (!this.image) {
      return;
    }
    this.selectedRegionBorder = event.border;
    this.selectedRegionHoleList = event.holeList;
    this.labelRegionModal?.open(this.image.id, event.border, event.holeList, this.regionLabelList);
  }

  public onRegionAdded(region: Region): void {
    this.regionSelector?.cancelDrawing();
    this.selectedRegionBorder = undefined;
    this.selectedRegionHoleList = [];
    this.regionList = [...this.regionList, region];
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
        { vertices: event.newBorder.getVertices() },
        event.newHoleList.map((hole) => {
          return { vertices: hole.getVertices() };
        })
      );
      this.regionList = [...this.regionList];
      this.regionList[event.regionID] = region;
    } catch (e) {
      this.handleError('Failed to update region boundary', e);
      return;
    }
    this.notificationService.success('Updated region boundary successfully', '');
  }

  public async addSelectedRegion(regionLabel: RegionLabel): Promise<void> {
    if (!this.image || !this.selectedRegionBorder || this.isAddingSelectedRegion) {
      return;
    }

    const border = { vertices: this.selectedRegionBorder.getVertices() };
    const holes = this.selectedRegionHoleList.map((hole) => {
      return { vertices: hole.getVertices() };
    });

    try {
      this.isAddingSelectedRegion = true;
      const region = await this.regionManagementService.createRegion(this.image.id, border, holes, regionLabel.id);
      this.notificationService.success('Region added successfully', '');
      this.regionList = [...this.regionList, region];
      this.selectedRegionBorder = undefined;
      this.selectedRegionHoleList = [];
      this.regionSelector?.cancelDrawing();
    } catch (e) {
      this.handleError('Failed to add region', e);
    } finally {
      this.isAddingSelectedRegion = false;
    }
  }

  public async onRegionDbClicked(event: RegionSelectorClickedEvent): Promise<void> {
    if (
      event.element !== RegionSelectorElement.REGION_LIST ||
      event.elementID === null ||
      this.isShowingRegionSnapshot
    ) {
      return;
    }

    const region = this.regionList[event.elementID];
    await this.openRegionInfoModal(region);
  }

  public async onContextMenu(event: RegionSelectorClickedEvent): Promise<void> {
    if (!this.image || !this.contextMenu || this.isShowingRegionSnapshot) {
      return;
    }

    this.contextMenuRegionID = undefined;
    this.contextMenuPointOfInterestID = undefined;

    if (event.element === RegionSelectorElement.REGION_LIST && event.elementID !== null) {
      this.contextMenuRegionID = event.elementID;
    }

    if (event.element === RegionSelectorElement.POINT_OF_INTEREST_LIST && event.elementID !== null) {
      this.contextMenuPointOfInterestID = event.elementID;
    }

    this.contextMenuMouseImagePos = event.mouseImagePos;
    this.contextMenuService.create(event.event, this.contextMenu);
  }

  public onContextMenuResetZoomClicked(): void {
    this.regionSelector?.resetZoom();
  }

  public onContextMenuAddPointOfInterestClicked(): void {
    if (!this.image || this.contextMenuMouseImagePos === undefined) {
      return;
    }

    this.addPoiModal?.open(this.image.id, this.contextMenuMouseImagePos);
  }

  public onPoiAdded(poi: PointOfInterest): void {
    this.pointOfInterestList = [...this.pointOfInterestList, poi];
  }

  public onContextMenuUpdatePointOfInterestClicked(): void {
    if (!this.image || this.contextMenuPointOfInterestID === undefined) {
      return;
    }

    this.updatePoiModal?.open(this.image.id, this.pointOfInterestList[this.contextMenuPointOfInterestID]);
  }

  public onPoiUpdated(poi: PointOfInterest): void {
    this.pointOfInterestList = this.pointOfInterestList.map((item) => {
      if (item.id !== poi.id) {
        return item;
      }

      return poi;
    });
  }

  public async onContextMenuDeletePointOfInterestClicked(): Promise<void> {
    if (!this.image || this.contextMenuPointOfInterestID === undefined) {
      return;
    }

    const poiID = this.pointOfInterestList[this.contextMenuPointOfInterestID].id;
    try {
      await this.imageManagementService.deletePointOfInterestOfImage(this.image.id, poiID);
      this.notificationService.success('Deleted point of interest successfully', '');
      this.pointOfInterestList = this.pointOfInterestList.filter((item) => item.id !== poiID);
    } catch (e) {
      this.handleError('Failed to delete point of interest', e);
    }
  }

  public isRegionListVisible(): boolean {
    return this.regionSelector?.isRegionListVisible() || false;
  }

  public onContextMenuHideRegionsClicked(): void {
    this.regionSelector?.hideRegionList();
  }

  public onContextMenuShowRegionsClicked(): void {
    this.regionSelector?.showRegionList();
  }

  public isDrawMarginsEnabled(): boolean {
    return this.regionSelector?.isDrawMarginsEnabled() || false;
  }

  public isVerticalDrawMarginsSymmetrical(): boolean {
    return this.regionSelector?.symmetricalVerticalDrawMargins || false;
  }

  public onVerticalDrawMarginsSymmetricalUpdate(v: boolean): void {
    if (this.regionSelector) {
      this.regionSelector.symmetricalVerticalDrawMargins = v;
    }
  }

  public isHorizontalDrawMarginsSymmetrical(): boolean {
    return this.regionSelector?.symmetricalHorizontalDrawMargins || false;
  }

  public onHorizontalDrawMarginsSymmetricalUpdate(v: boolean): void {
    if (this.regionSelector) {
      this.regionSelector.symmetricalHorizontalDrawMargins = v;
    }
  }

  public onContextMenuHideDrawMarginsClicked(): void {
    this.regionSelector?.hideDrawMargins();
  }

  public onContextMenuShowDrawMarginsClicked(): void {
    this.regionSelector?.showDrawMargins();
  }

  public isDrawBoundaryEnabled(): boolean {
    return this.regionSelector?.isDrawBoundaryEnabled() || false;
  }

  public onContextMenuHideDrawBoundaryClicked(): void {
    this.regionSelector?.hideDrawBoundary();
  }

  public onContextMenuShowDrawBoundaryClicked(): void {
    this.regionSelector?.showDrawBoundary();
  }

  public onContextMenuCenterDrawBoundaryInImageClicked(): void {
    this.regionSelector?.centerDrawBoundaryInImage();
  }

  public onContextMenuCenterDrawBoundaryInDrawMarginsClicked(): void {
    this.regionSelector?.centerDrawBoundaryInDrawMargins();
  }

  public isRegionSelectorDrawingOrDeleting(): boolean {
    return this.regionSelector?.isEditing() || false;
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

  public async onContextMenuRelabelRegionLabelClicked(regionLabel: RegionLabel): Promise<void> {
    if (!this.image || this.contextMenuRegionID === undefined) {
      return;
    }

    const region = this.regionList[this.contextMenuRegionID];
    try {
      const updatedRegion = await this.regionManagementService.updateRegionRegionLabel(
        this.image.id,
        region.id,
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
    if (this.contextMenuRegionID === undefined) {
      return;
    }

    const region = this.regionList[this.contextMenuRegionID];
    await this.openRegionInfoModal(region);
  }

  public async onContextMenuDeleteRegionClicked(): Promise<void> {
    if (!this.image || this.contextMenuRegionID === undefined) {
      return;
    }
    const region = this.regionList[this.contextMenuRegionID];
    try {
      await this.regionManagementService.deleteRegion(this.image.id, region.id);
    } catch (e) {
      this.handleError('Failed to delete region', e);
      return;
    }
    this.notificationService.success('Deleted region successfully', '');
    this.onRegionDeleted(region);
  }

  private async openRegionInfoModal(region: Region): Promise<void> {
    if (!this.image) {
      return;
    }
    await this.regionInformationModal?.open(this.image, region, this.isImageEditable || this.isImageVerifiable);
  }

  public onRegionDeleted(deletedRegion: Region): void {
    this.regionList = this.regionList.filter((region) => region.id !== deletedRegion.id);
  }

  public async onImageTypeUpdated(imageType: ImageType): Promise<void> {
    await this.initializePage();
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

  private onRouterEvent(event: any): void {
    if (event instanceof NavigationStart) {
      this.saveImageMargins();
      this.saveImageBoundary();
    }
  }

  private saveImageMargins(): void {
    if (this.regionSelector === undefined) {
      return;
    }

    const drawMargins = this.regionSelector.getDrawMargins();
    store.set(MANAGE_IMAGE_DRAW_MARGINS_ENABLED_KEY, this.isDrawMarginsEnabled());
    store.set(MANAGE_IMAGE_SYMMETRICAL_VERTICAL_DRAW_MARGINS_ENABLED_KEY, this.isVerticalDrawMarginsSymmetrical());
    store.set(MANAGE_IMAGE_SYMMETRICAL_HORIZONTAL_DRAW_MARGINS_ENABLED_KEY, this.isHorizontalDrawMarginsSymmetrical());
    store.set(MANAGE_IMAGE_DRAW_MARGINS_LEFT_KEY, drawMargins.left);
    store.set(MANAGE_IMAGE_DRAW_MARGINS_RIGHT_KEY, drawMargins.right);
    store.set(MANAGE_IMAGE_DRAW_MARGINS_BOTTOM_KEY, drawMargins.bottom);
    store.set(MANAGE_IMAGE_DRAW_MARGINS_TOP_KEY, drawMargins.top);
  }

  private saveImageBoundary(): void {
    store.set(MANAGE_IMAGE_DRAW_BOUNDARY_ENABLED_KEY, this.isDrawBoundaryEnabled());
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
    if (e instanceof ImageCannotBeAssignedWithImageTagError) {
      this.notificationService.error(notificationTitle, 'Image of this image type cannot be assigned with image tag');
      return;
    }
    if (e instanceof ImageDoesNotHaveImageTagError) {
      this.notificationService.error(notificationTitle, 'Image does not have image tag');
      return;
    }
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image cannot be found');
      this.location.back();
      return;
    }
    if (e instanceof ImageOrImageTagNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image or image tag cannot be found');
      return;
    }
    if (e instanceof ImageOrImageTypeNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image or image type cannot be found');
      return;
    }
    if (e instanceof InvalidImageInformationError) {
      this.notificationService.error(notificationTitle, 'Invalid image information');
      return;
    }
    if (e instanceof InvalidImageStatusError) {
      this.notificationService.error(notificationTitle, 'Invalid image status');
      return;
    }
    if (e instanceof InvalidRegionInformation) {
      this.notificationService.error(notificationTitle, 'Invalid region information');
      return;
    }
    if (e instanceof RegionLabelCannotBeAssignedToImageError) {
      this.notificationService.error(notificationTitle, 'Region label cannot be assigned to image of this image type');
      return;
    }
    if (e instanceof RegionNotFoundError) {
      this.notificationService.error(notificationTitle, 'Region cannot be found');
      return;
    }
    if (e instanceof ImageHasUnlabeledRegionError) {
      this.notificationService.error(notificationTitle, 'Image has at least one unlabeled region');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
