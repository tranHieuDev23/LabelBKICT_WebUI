import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ImageListFilterOptions,
  ImageListSortOption,
  ImageStatus,
  ImageTag,
  ImageTagGroup,
  ImageTagsService,
  ImageType,
  ImageTypesService,
  RegionLabel,
  UnauthenticatedError,
  UnauthorizedError,
  User,
} from 'src/app/services/dataaccess/api';
import { ImageStatusService } from 'src/app/services/module/image-management/image-status.service';
import { DelayedCallbackService } from 'src/app/services/utils/delayed-callback/delayed-callback.service';

export class ImageFilterOptionsSelectorConfig {
  public canFilterImageType = true;
  public canFilterImageStatus = true;
  public canFilterUploadedByUser = true;
  public canFilterUploadTime = true;
  public canFilterPublishedByUser = true;
  public canFilterPublishTime = true;
  public canFilterVerifiedByUser = true;
  public canFilterVerifyTime = true;
  public canFilterImageTag = true;
  public canFilterRegionLabel = true;
  public canFilterOriginalFilename = true;
}

const UPLOAD_BY_USER_SEARCH_CALLBACK_ID = 'UPLOAD_BY_USER_SEARCH_CALLBACK_ID';
const UPLOAD_BY_USER_SEARCH_CALLBACK_DELAY = 1000;
const PUBLISHED_BY_USER_SEARCH_CALLBACK_ID =
  'PUBLISHED_BY_USER_SEARCH_CALLBACK_ID';
const PUBLISHED_BY_USER_SEARCH_CALLBACK_DELAY = 1000;
const VERIFIED_BY_USER_SEARCH_CALLBACK_ID =
  'VERIFIED_BY_USER_SEARCH_CALLBACK_ID';
const VERIFIED_BY_USER_SEARCH_CALLBACK_DELAY = 1000;
const ORIGINAL_FILE_NAME_INPUT_CALLBACK_ID =
  'ORIGINAL_FILE_NAME_INPUT_CALLBACK_ID';
const ORIGINAL_FILE_NAME_INPUT_CALLBACK_DELAY = 1000;

@Component({
  selector: 'app-image-filter-options-selector',
  templateUrl: './image-filter-options-selector.component.html',
  styleUrls: ['./image-filter-options-selector.component.scss'],
})
export class ImageFilterOptionsSelectorComponent implements OnInit {
  @Input() public filterOptions = new ImageListFilterOptions();
  @Input() public sortOption = ImageListSortOption.UPLOAD_TIME_DESCENDING;
  @Input() public selectorConfig = new ImageFilterOptionsSelectorConfig();

  @Input() public uploadedByUserOptionList: User[] = [];
  @Input() public publishedByUserOptionList: User[] = [];
  @Input() public verifiedByUserOptionList: User[] = [];

  @Output() public uploadedByUserSearch = new EventEmitter<string>();
  @Output() public publishedByUserSearch = new EventEmitter<string>();
  @Output() public verifiedByUserSearch = new EventEmitter<string>();
  @Output() public filterOptionsUpdated =
    new EventEmitter<ImageListFilterOptions>();
  @Output() public sortOptionUpdated = new EventEmitter<ImageListSortOption>();

  public imageStatusList: ImageStatus[] = [
    ImageStatus.UPLOADED,
    ImageStatus.PUBLISHED,
    ImageStatus.VERIFIED,
    ImageStatus.EXCLUDED,
  ];
  public imageListSortOptionList: ImageListSortOption[] = [
    ImageListSortOption.UPLOAD_TIME_DESCENDING,
    ImageListSortOption.UPLOAD_TIME_ASCENDING,
    ImageListSortOption.PUBLISH_TIME_DESCENDING,
    ImageListSortOption.PUBLISH_TIME_ASCENDING,
    ImageListSortOption.VERIFY_TIME_DESCENDING,
    ImageListSortOption.VERIFY_TIME_ASCENDING,
    ImageListSortOption.ID_ASCENDING,
    ImageListSortOption.ID_DESCENDING,
  ];

  public imageTypeList: ImageType[] = [];
  public regionLabelList: RegionLabel[][] = [];
  public imageTagGroupList: ImageTagGroup[] = [];
  public imageTagList: ImageTag[][] = [];

  public selectedUploadedByUserList: User[] = [];
  public selectedPublishedByUserList: User[] = [];
  public selectedVerifiedByUserList: User[] = [];

  public selectedUploadTimeRange: Date[] = [];
  public selectedPublishTimeRange: Date[] = [];
  public selectedVerifyTimeRange: Date[] = [];

  constructor(
    private readonly imageStatusService: ImageStatusService,
    private readonly imageTypesService: ImageTypesService,
    private readonly imageTagsService: ImageTagsService,
    private readonly notificationService: NzNotificationService,
    private readonly delayedCallbackService: DelayedCallbackService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      try {
        const { imageTypeList, regionLabelList } =
          await this.imageTypesService.getImageTypeList(true);
        const { imageTagGroupList, imageTagList } =
          await this.imageTagsService.getImageTagGroupList(true, false);
        this.imageTypeList = imageTypeList;
        this.regionLabelList = regionLabelList || [];
        this.imageTagGroupList = imageTagGroupList;
        this.imageTagList = imageTagList || [];
      } catch (e) {
        if (e instanceof UnauthenticatedError) {
          this.notificationService.error(
            'Failed to load page',
            'User is not logged in'
          );
          this.router.navigateByUrl('/login');
        } else if (e instanceof UnauthorizedError) {
          this.notificationService.error(
            'Failed to load page',
            'User does not have the required permission'
          );
          this.router.navigateByUrl('/welcome');
        } else {
          console.log(e);
          this.notificationService.error(
            'Failed to load page',
            'Unknown error'
          );
          this.router.navigateByUrl('/welcome');
        }
      }
    })().then();
  }

  public getImageStatusString(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusString(status);
  }

  public getImageListSortOptionString(sortOption: ImageListSortOption): string {
    switch (sortOption) {
      case ImageListSortOption.ID_ASCENDING:
        return 'Image ID (Asc.)';
      case ImageListSortOption.ID_DESCENDING:
        return 'Image ID (Desc.)';
      case ImageListSortOption.UPLOAD_TIME_ASCENDING:
        return 'Upload time (Asc.)';
      case ImageListSortOption.UPLOAD_TIME_DESCENDING:
        return 'Upload time (Desc.)';
      case ImageListSortOption.PUBLISH_TIME_ASCENDING:
        return 'Publish time (Asc.)';
      case ImageListSortOption.PUBLISH_TIME_DESCENDING:
        return 'Publish time (Desc.)';
      case ImageListSortOption.VERIFY_TIME_ASCENDING:
        return 'Verify time (Asc.)';
      case ImageListSortOption.VERIFY_TIME_DESCENDING:
        return 'Verify time (Desc.)';
    }
  }

  public onFilterOptionsUpdated(): void {
    this.filterOptionsUpdated.emit(this.filterOptions);
  }

  public resetFilterOptions(): void {
    this.filterOptions = new ImageListFilterOptions();
    this.onFilterOptionsUpdated();
  }

  public onUploadedByUserSearch(query: string): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      UPLOAD_BY_USER_SEARCH_CALLBACK_ID,
      () => {
        this.uploadedByUserSearch.emit(query);
      },
      UPLOAD_BY_USER_SEARCH_CALLBACK_DELAY
    );
  }

  public onSelectedUploadedByUserListUpdated(userList: User[]): void {
    this.filterOptions.uploadedByUserIDList = userList.map((user) => user.id);
    this.onFilterOptionsUpdated();
  }

  public onPublishedByUserSearch(query: string): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      UPLOAD_BY_USER_SEARCH_CALLBACK_ID,
      () => {
        this.publishedByUserSearch.emit(query);
      },
      UPLOAD_BY_USER_SEARCH_CALLBACK_DELAY
    );
  }

  public onSelectedPublishedByUserListUpdated(userList: User[]): void {
    this.filterOptions.publishedByUserIDList = userList.map((user) => user.id);
    this.onFilterOptionsUpdated();
  }

  public onVerifiedByUserSearch(query: string): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      UPLOAD_BY_USER_SEARCH_CALLBACK_ID,
      () => {
        this.verifiedByUserSearch.emit(query);
      },
      UPLOAD_BY_USER_SEARCH_CALLBACK_DELAY
    );
  }

  public onSelectedVerifiedByUserListUpdated(userList: User[]): void {
    this.filterOptions.verifiedByUserIDList = userList.map((user) => user.id);
    this.onFilterOptionsUpdated();
  }

  public onSelectedUploadTimeRangeUpdated(range: Date[]): void {
    if (range.length === 0) {
      this.filterOptions.uploadTimeStart = 0;
      this.filterOptions.uploadTimeEnd = 0;
    } else {
      this.filterOptions.uploadTimeStart = range[0].getTime();
      this.filterOptions.uploadTimeEnd = range[1].getTime();
    }
    this.onFilterOptionsUpdated();
  }

  public onSelectedPublishTimeRangeUpdated(range: Date[]): void {
    if (range.length === 0) {
      this.filterOptions.publishTimeStart = 0;
      this.filterOptions.publishTimeEnd = 0;
    } else {
      this.filterOptions.publishTimeStart = range[0].getTime();
      this.filterOptions.publishTimeEnd = range[1].getTime();
    }
    this.onFilterOptionsUpdated();
  }

  public onSelectedVerifyTimeRangeUpdated(range: Date[]): void {
    if (range.length === 0) {
      this.filterOptions.verifyTimeStart = 0;
      this.filterOptions.verifyTimeEnd = 0;
    } else {
      this.filterOptions.verifyTimeStart = range[0].getTime();
      this.filterOptions.verifyTimeEnd = range[1].getTime();
    }
    this.onFilterOptionsUpdated();
  }

  public onOriginalFileNameInputChanged(): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      ORIGINAL_FILE_NAME_INPUT_CALLBACK_ID,
      () => {
        this.filterOptionsUpdated.emit(this.filterOptions);
      },
      ORIGINAL_FILE_NAME_INPUT_CALLBACK_DELAY
    );
  }

  public onSelectedImageListSortOptionChanged(
    option: ImageListSortOption
  ): void {
    this.sortOptionUpdated.emit(option);
  }
}
