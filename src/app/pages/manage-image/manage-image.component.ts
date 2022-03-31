import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EditableTextComponent } from 'src/app/components/editable-text/editable-text.component';
import { Polygon } from 'src/app/components/region-selector/models';
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
  Region,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { ImageStatusService } from 'src/app/services/module/image-management/image-status.service';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss'],
})
export class ManageImageComponent implements OnInit {
  @ViewChild(RegionSelectorComponent, { static: false })
  public regionSelector: RegionSelectorComponent | undefined;
  @ViewChild('descriptionEditableText', { static: false })
  public descriptionEditableText: EditableTextComponent | undefined;
  @ViewChild('contextMenu', { static: false })
  public contextMenu: NzDropdownMenuComponent | undefined;

  public image: Image | undefined;
  public imageTagList: ImageTag[] = [];
  public regionList: Region[] = [];
  public editable = true;

  private filterOptions: ImageListFilterOptions | undefined;

  public selectedRegion: Polygon[] = [];

  public allowedImageTagGroupListForImageType: ImageTagGroup[] = [];
  public allowedImageTagListForImageType: ImageTag[][] = [];

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly imageManagementService: ImageManagementService,
    private readonly imageTypesService: ImageTypesService,
    private readonly imageStatusService: ImageStatusService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly jsonCompress: JSONCompressService
  ) {}

  ngOnInit(): void {
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
        const { imageTagGroupList, imageTagList } =
          await this.imageTypesService.getImageTagGroupListOfImageType(
            image.imageType.id
          );
        this.allowedImageTagGroupListForImageType = imageTagGroupList;
        this.allowedImageTagListForImageType = imageTagList;
      } else {
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
      } else if (e instanceof ImageOrImageTagNotFoundError) {
        this.notificationService.error(
          'Failed to update image description',
          'Image or image tag cannot be found'
        );
      } else if (e instanceof ImageDoesNotHaveImageTagError) {
        this.notificationService.error(
          'Failed to update image description',
          'Image does not have image tag'
        );
      } else {
        console.log(e);
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
}
