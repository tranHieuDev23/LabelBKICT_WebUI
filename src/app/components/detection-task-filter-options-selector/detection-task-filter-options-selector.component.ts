import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  DetectionTaskListSortOption,
  ImageListFilterOptionsWithMetadata,
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
import { DateToTimeService } from 'src/app/services/utils/date-to-time/date-to-time.service';
import { DelayedCallbackService } from 'src/app/services/utils/delayed-callback/delayed-callback.service';

export class DetectionTaskFilterOptionsSelectorConfig {
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
  public canFilterBookmarked = true;
  public canFilterDescription = true;
}

const UPLOAD_BY_USER_SEARCH_CALLBACK_ID = 'UPLOAD_BY_USER_SEARCH_CALLBACK_ID';
const UPLOAD_BY_USER_SEARCH_CALLBACK_DELAY = 1000;
const PUBLISHED_BY_USER_SEARCH_CALLBACK_ID = 'PUBLISHED_BY_USER_SEARCH_CALLBACK_ID';
const PUBLISHED_BY_USER_SEARCH_CALLBACK_DELAY = 1000;
const VERIFIED_BY_USER_SEARCH_CALLBACK_ID = 'VERIFIED_BY_USER_SEARCH_CALLBACK_ID';
const VERIFIED_BY_USER_SEARCH_CALLBACK_DELAY = 1000;
const ORIGINAL_FILE_NAME_INPUT_CALLBACK_ID = 'ORIGINAL_FILE_NAME_INPUT_CALLBACK_ID';
const ORIGINAL_FILE_NAME_INPUT_CALLBACK_DELAY = 1000;

@Component({
  selector: 'app-detection-task-filter-options-selector',
  templateUrl: './detection-task-filter-options-selector.component.html',
  styleUrls: ['./detection-task-filter-options-selector.component.scss'],
})
export class DetectionTaskFilterOptionsSelectorComponent implements OnInit {
  private _filterOptions = new ImageListFilterOptionsWithMetadata();

  @Input() public set filterOptions(v: ImageListFilterOptionsWithMetadata) {
    this._filterOptions = v;
    this.selectedUploadTimeRange = this.getTimeRange(v.uploadTimeStart, v.uploadTimeEnd);
    this.selectedPublishTimeRange = this.getTimeRange(v.publishTimeStart, v.publishTimeEnd);
    this.selectedVerifyTimeRange = this.getTimeRange(v.verifyTimeStart, v.verifyTimeEnd);
  }

  private getTimeRange(startTime: number, endTime: number): Date[] {
    if (startTime !== 0 || endTime !== 0) {
      return [new Date(startTime), new Date(endTime)];
    }
    return [];
  }

  public get filterOptions(): ImageListFilterOptionsWithMetadata {
    return this._filterOptions;
  }

  @Input() public sortOption = DetectionTaskListSortOption.REQUEST_TIME_DESCENDING;
  @Input() public selectorConfig = new DetectionTaskFilterOptionsSelectorConfig();

  @Input() public uploadedByUserOptionList: User[] = [];
  @Input() public publishedByUserOptionList: User[] = [];
  @Input() public verifiedByUserOptionList: User[] = [];

  @Output() public uploadedByUserSearch = new EventEmitter<string>();
  @Output() public publishedByUserSearch = new EventEmitter<string>();
  @Output() public verifiedByUserSearch = new EventEmitter<string>();
  @Output() public filterOptionsUpdated = new EventEmitter<ImageListFilterOptionsWithMetadata>();
  @Output() public sortOptionUpdated = new EventEmitter<DetectionTaskListSortOption>();

  public imageStatusList: ImageStatus[] = [
    ImageStatus.UPLOADED,
    ImageStatus.PUBLISHED,
    ImageStatus.VERIFIED,
    ImageStatus.EXCLUDED,
  ];
  public detectionTaskListSortOptionList: DetectionTaskListSortOption[] = [
    DetectionTaskListSortOption.ID_ASCENDING,
    DetectionTaskListSortOption.ID_DESCENDING,
    DetectionTaskListSortOption.REQUEST_TIME_ASCENDING,
    DetectionTaskListSortOption.REQUEST_TIME_DESCENDING,
    DetectionTaskListSortOption.UPDATE_TIME_ASCENDING,
    DetectionTaskListSortOption.UPDATE_TIME_DESCENDING,
  ];

  public imageTypeList: ImageType[] = [];
  public regionLabelList: RegionLabel[][] = [];
  public imageTagGroupList: ImageTagGroup[] = [];
  public imageTagList: ImageTag[][] = [];

  public selectedUploadTimeRange: Date[] = [];
  public selectedPublishTimeRange: Date[] = [];
  public selectedVerifyTimeRange: Date[] = [];

  public sameIDCompareFunc = (o1: any, o2: any) => {
    return o1?.id === o2?.id;
  };

  constructor(
    private readonly imageStatusService: ImageStatusService,
    private readonly imageTypesService: ImageTypesService,
    private readonly imageTagsService: ImageTagsService,
    private readonly notificationService: NzNotificationService,
    private readonly delayedCallbackService: DelayedCallbackService,
    private readonly dateToTimeService: DateToTimeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      try {
        const { imageTypeList, regionLabelList } = await this.imageTypesService.getImageTypeList(true);
        const { imageTagGroupList, imageTagList } = await this.imageTagsService.getImageTagGroupList(true, false);
        this.imageTypeList = imageTypeList;
        this.regionLabelList = regionLabelList || [];
        this.imageTagGroupList = imageTagGroupList;
        this.imageTagList = imageTagList || [];
      } catch (e) {
        if (e instanceof UnauthenticatedError) {
          this.notificationService.error('Failed to load page', 'User is not logged in');
          this.router.navigateByUrl('/login');
        } else if (e instanceof UnauthorizedError) {
          this.notificationService.error('Failed to load page', 'User does not have the required permission');
          this.router.navigateByUrl('/welcome');
        } else {
          this.notificationService.error('Failed to load page', 'Unknown error');
          this.router.navigateByUrl('/welcome');
        }
      }
    })().then();
  }

  public getImageStatusString(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusString(status);
  }

  public getDetectionTaskListSortOptionString(sortOption: DetectionTaskListSortOption): string {
    switch (sortOption) {
      case DetectionTaskListSortOption.ID_ASCENDING:
        return 'Detection task ID (Asc.)';
      case DetectionTaskListSortOption.ID_DESCENDING:
        return 'Detection task ID (Desc.)';
      case DetectionTaskListSortOption.REQUEST_TIME_ASCENDING:
        return 'Request time (Asc.)';
      case DetectionTaskListSortOption.REQUEST_TIME_DESCENDING:
        return 'Request time (Desc.)';
      case DetectionTaskListSortOption.UPDATE_TIME_ASCENDING:
        return 'Update time (Asc.)';
      case DetectionTaskListSortOption.UPDATE_TIME_DESCENDING:
        return 'Update time (Desc.)';
    }
  }

  public onFilterOptionsUpdated(): void {
    this.filterOptionsUpdated.emit(this._filterOptions);
  }

  public resetFilterOptions(): void {
    this._filterOptions = new ImageListFilterOptionsWithMetadata();
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

  public onPublishedByUserSearch(query: string): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      PUBLISHED_BY_USER_SEARCH_CALLBACK_ID,
      () => {
        this.publishedByUserSearch.emit(query);
      },
      PUBLISHED_BY_USER_SEARCH_CALLBACK_DELAY
    );
  }

  public onVerifiedByUserSearch(query: string): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      VERIFIED_BY_USER_SEARCH_CALLBACK_ID,
      () => {
        this.verifiedByUserSearch.emit(query);
      },
      VERIFIED_BY_USER_SEARCH_CALLBACK_DELAY
    );
  }

  public onSelectedUploadTimeRangeUpdated(range: Date[]): void {
    if (range.length === 0) {
      this._filterOptions.uploadTimeStart = 0;
      this._filterOptions.uploadTimeEnd = 0;
    } else {
      this._filterOptions.uploadTimeStart = this.dateToTimeService.getUnixTimestampFromDate(range[0]);
      this._filterOptions.uploadTimeEnd = this.dateToTimeService.getUnixTimestampFromDate(range[1]);
    }
    this.onFilterOptionsUpdated();
  }

  public onSelectedPublishTimeRangeUpdated(range: Date[]): void {
    if (range.length === 0) {
      this._filterOptions.publishTimeStart = 0;
      this._filterOptions.publishTimeEnd = 0;
    } else {
      this._filterOptions.publishTimeStart = this.dateToTimeService.getUnixTimestampFromDate(range[0]);
      this._filterOptions.publishTimeEnd = this.dateToTimeService.getUnixTimestampFromDate(range[1]);
    }
    this.onFilterOptionsUpdated();
  }

  public onSelectedVerifyTimeRangeUpdated(range: Date[]): void {
    if (range.length === 0) {
      this._filterOptions.verifyTimeStart = 0;
      this._filterOptions.verifyTimeEnd = 0;
    } else {
      this._filterOptions.verifyTimeStart = this.dateToTimeService.getUnixTimestampFromDate(range[0]);
      this._filterOptions.verifyTimeEnd = this.dateToTimeService.getUnixTimestampFromDate(range[1]);
    }
    this.onFilterOptionsUpdated();
  }

  public onOriginalFileNameInputChanged(): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      ORIGINAL_FILE_NAME_INPUT_CALLBACK_ID,
      () => {
        this.onFilterOptionsUpdated();
      },
      ORIGINAL_FILE_NAME_INPUT_CALLBACK_DELAY
    );
  }

  public onSelectedDetectionTaskListSortOptionChanged(option: DetectionTaskListSortOption): void {
    this.sortOptionUpdated.emit(option);
  }
}
