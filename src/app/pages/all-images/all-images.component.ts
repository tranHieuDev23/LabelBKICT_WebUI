import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ImageListFilterOptionsWithMetadata } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.component';
import {
  ImageListSortOption,
  User,
  Image,
  ImageTag,
  InvalidImageListFilterOptionsError,
  UnauthenticatedError,
  UnauthorizedError,
  ImageType,
  OneOrMoreImagesNotFoundError,
  TooManyImagesError,
  ImageTagGroup,
  ImageTagGroupAndTagList,
  ClassificationType,
} from 'src/app/services/dataaccess/api';
import { ClassificationTypeManagementService } from 'src/app/services/module/classification-type-management';
import {
  ImageListManagementService,
  FilterOptionsService,
} from 'src/app/services/module/image-list-management';
import { ImageTagManagementService } from 'src/app/services/module/image-tag-management';
import { ImageTypeManagementService } from 'src/app/services/module/image-type-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { getUniqueValueList } from 'src/app/services/utils/array/unique-values';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT_OPTION = ImageListSortOption.UPLOAD_TIME_DESCENDING;
const MAX_SEARCH_USER_RESULT = 10;

@Component({
  selector: 'app-all-images',
  templateUrl: './all-images.component.html',
  styleUrls: ['./all-images.component.scss'],
})
export class AllImagesComponent implements OnInit {
  @ViewChild('contextMenu') public contextMenu:
    | NzDropdownMenuComponent
    | undefined;

  public pageIndex: number = DEFAULT_PAGE_INDEX;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public filterOptions: ImageListFilterOptionsWithMetadata =
    this.getDefaultImageListFilterOptions();
  public imageListSortOption = DEFAULT_SORT_OPTION;

  public uploadedByUserOptionList: User[] = [];
  public publishedByUserOptionList: User[] = [];
  public verifiedByUserOptionList: User[] = [];

  public fromImageIndex: number = 0;
  public toImageIndex: number = 0;
  public totalImageCount: number = 0;
  public imageList: Image[] = [];
  public imageTagList: ImageTag[][] = [];
  public isLoadingImageList: boolean = false;

  private getDefaultImageListFilterOptions(): ImageListFilterOptionsWithMetadata {
    const filterOptions = new ImageListFilterOptionsWithMetadata();
    return filterOptions;
  }

  public imageTypeList: ImageType[] = [];

  public classificationTypeList: ClassificationType[] = [];

  private selectedIndexList: number[] = [];

  public isAddImageTagToSelectedImageListModalVisible: boolean = false;
  public addImageTagToSelectedImageListModalImageTagGroupList: ImageTagGroup[] =
    [];
  public addImageTagToSelectedImageListModalImageTagList: ImageTag[][] = [];
  public addImageTagToSelectedImageListModalCurrentImageTagList: ImageTag[] =
    [];
  public addImageTagToSelectedImageListModalAddedImageTagList: ImageTag[] = [];

  constructor(
    private readonly imageListManagementService: ImageListManagementService,
    private readonly filterOptionsService: FilterOptionsService,
    private readonly userManagementService: UserManagementService,
    private readonly imageTypeManagementService: ImageTypeManagementService,
    private readonly imageTagManagementService: ImageTagManagementService,
    private readonly classificationTypeManagementService: ClassificationTypeManagementService,
    private readonly paginationService: PaginationService,
    private readonly jsonCompressService: JSONCompressService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly notificationService: NzNotificationService,
    private readonly contextMenuService: NzContextMenuService,
    private readonly modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      await this.onQueryParamsChanged(params);
    });
  }

  private async onQueryParamsChanged(queryParams: Params): Promise<void> {
    this.getPaginationInfoFromQueryParams(queryParams);
    await this.getImageListFromPaginationInfo();
  }

  private getPaginationInfoFromQueryParams(queryParams: Params): void {
    if (queryParams['index'] !== undefined) {
      this.pageIndex = +queryParams['index'];
    } else {
      this.pageIndex = DEFAULT_PAGE_INDEX;
    }
    if (queryParams['size'] !== undefined) {
      this.pageSize = +queryParams['size'];
    } else {
      this.pageSize = DEFAULT_PAGE_SIZE;
    }
    if (queryParams['sort'] !== undefined) {
      this.imageListSortOption = +queryParams['sort'];
    } else {
      this.imageListSortOption = DEFAULT_SORT_OPTION;
    }
    if (queryParams['filter'] !== undefined) {
      this.filterOptions = this.jsonCompressService.decompress(
        queryParams['filter']
      );
    } else {
      this.filterOptions = this.getDefaultImageListFilterOptions();
    }
  }

  private async getImageListFromPaginationInfo(): Promise<void> {
    this.isLoadingImageList = true;
    const offset = this.paginationService.getPageOffset(
      this.pageIndex,
      this.pageSize
    );
    const filterOptions =
      this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(
        this.filterOptions
      );
    try {
      const { totalImageCount, imageList, imageTagList } =
        await this.imageListManagementService.getUserManageableImageList(
          offset,
          this.pageSize,
          this.imageListSortOption,
          filterOptions
        );
      this.totalImageCount = totalImageCount;
      this.imageList = imageList;
      this.imageTagList = imageTagList;
      this.fromImageIndex = offset + 1;
      this.toImageIndex = offset + imageList.length;
    } catch (e) {
      this.handleError('Failed to get image list', e);
    } finally {
      this.isLoadingImageList = false;
    }
  }

  public async onUploadedByUserSearch(query: string): Promise<void> {
    query = query.trim();
    if (query === '') {
      this.uploadedByUserOptionList = [];
    } else {
      this.uploadedByUserOptionList =
        await this.imageListManagementService.searchUserManageableImageUserList(
          query,
          MAX_SEARCH_USER_RESULT
        );
    }
  }

  public async onPublishedByUserSearch(query: string): Promise<void> {
    query = query.trim();
    if (query === '') {
      this.publishedByUserOptionList = [];
    } else {
      this.publishedByUserOptionList =
        await this.userManagementService.searchUserList(
          query,
          MAX_SEARCH_USER_RESULT
        );
    }
  }

  public async onVerifiedByUserSearch(query: string): Promise<void> {
    query = query.trim();
    if (query === '') {
      this.publishedByUserOptionList = [];
    } else {
      this.verifiedByUserOptionList =
        await this.userManagementService.searchUserList(
          query,
          MAX_SEARCH_USER_RESULT
        );
    }
  }

  public onImageListFilterOptionsUpdated(
    filterOptions: ImageListFilterOptionsWithMetadata
  ): void {
    this.navigateToPage(
      this.pageIndex,
      this.pageSize,
      this.imageListSortOption,
      filterOptions
    );
  }

  public onImageListSortOptionUploaded(sortOption: ImageListSortOption): void {
    this.navigateToPage(
      this.pageIndex,
      this.pageSize,
      sortOption,
      this.filterOptions
    );
  }

  public onPageIndexChanged(newPageIndex: number): void {
    this.navigateToPage(
      newPageIndex,
      this.pageSize,
      this.imageListSortOption,
      this.filterOptions
    );
  }

  public onPageSizeChanged(newPageSize: number): void {
    this.navigateToPage(
      this.pageIndex,
      newPageSize,
      this.imageListSortOption,
      this.filterOptions
    );
  }

  private navigateToPage(
    pageIndex: number,
    pageSize: number,
    sortOption: ImageListSortOption,
    filterOptions: ImageListFilterOptionsWithMetadata
  ) {
    const queryParams: any = {};
    if (pageIndex !== DEFAULT_PAGE_INDEX) {
      queryParams['index'] = pageIndex;
    }
    if (pageSize !== DEFAULT_PAGE_SIZE) {
      queryParams['size'] = pageSize;
    }
    if (sortOption !== DEFAULT_SORT_OPTION) {
      queryParams['sort'] = sortOption;
    }
    queryParams['filter'] = this.jsonCompressService.compress(filterOptions);
    this.router.navigate(['/all-images'], { queryParams });
  }

  public onImageGridImageListSelected(imageIndexList: number[]): void {
    this.selectedIndexList = imageIndexList;
  }

  public onImageGridContextMenu(event: MouseEvent): boolean {
    if (this.selectedIndexList.length === 0) {
      return false;
    }
    (async () => {
      if (this.imageTypeList.length === 0) {
        try {
          const { imageTypeList } =
            await this.imageTypeManagementService.getImageTypeList();
          this.imageTypeList = imageTypeList;
        } catch (e) {
          this.handleError('Failed to get image type list', e);
          return;
        }
      }

      if (this.classificationTypeList.length === 0) {
        try {
          const classificationTypeList = 
            await this.classificationTypeManagementService.getClassificationTypeList();
          this.classificationTypeList = classificationTypeList;
        } catch (e) {
          this.handleError('Failed to get classification type list', e);
          return;
        }
      }

      if (this.contextMenu) {
        this.contextMenuService.create(event, this.contextMenu);
      }
    })().then();
    return false;
  }

  public onSetImageTypeOfSelectedImagesClicked(imageType: ImageType): void {
    const selectedImageIDList = this.selectedIndexList.map(
      (index) => this.imageList[index].id
    );
    this.modalService.create({
      nzTitle: 'Change image type of selected image(s)',
      nzContent:
        'Are you sure? This will also remove all image tags from these images, and ' +
        'mark all region extracted from them as not labeled. This action is <b>IRREVERSIBLE</b>.',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await this.imageListManagementService.updateImageListImageType(
            selectedImageIDList,
            imageType.id
          );
          await this.getImageListFromPaginationInfo();
          this.notificationService.success(
            'Changed image type of selected image(s) successfully',
            ''
          );
        } catch (e) {
          this.handleError(
            'Failed to change image type of selected image(s)',
            e
          );
        }
      },
    });
  }

  public async onAddImageTagToSelectedImageListClicked(): Promise<void> {
    if (this.selectedIndexList.length === 0) {
      return;
    }

    const hasImageWithNoType =
      this.selectedIndexList.findIndex(
        (index) => this.imageList[index].imageType === null
      ) != -1;
    if (hasImageWithNoType) {
      this.notificationService.info(
        'Cannot assign image tags because one or more selected images does not have an image type',
        ''
      );
      return;
    }

    const selectedImageTypeIDList = getUniqueValueList(
      this.selectedIndexList.map(
        (index) => this.imageList[index].imageType?.id || 0
      )
    );
    let imageTagGroupAndTagListOfImageTypeList: ImageTagGroupAndTagList[] = [];
    try {
      imageTagGroupAndTagListOfImageTypeList =
        await this.imageTypeManagementService.getImageTagGroupListOfImageTypeList(
          selectedImageTypeIDList
        );
    } catch (e) {
      this.handleError('Failed to retrieve eligible image tag group list', e);
      return;
    }

    const intersectionImageTagGroupAndTagListOfImageTypeList =
      this.imageTagManagementService.getIntersectionImageTagGroupAndTagList(
        imageTagGroupAndTagListOfImageTypeList
      );
    this.isAddImageTagToSelectedImageListModalVisible = true;
    this.addImageTagToSelectedImageListModalImageTagGroupList =
      intersectionImageTagGroupAndTagListOfImageTypeList.imageTagGroupList;
    this.addImageTagToSelectedImageListModalImageTagList =
      intersectionImageTagGroupAndTagListOfImageTypeList.imageTagList;
    this.addImageTagToSelectedImageListModalCurrentImageTagList =
      this.imageTagManagementService.getUnionImageTagList(
        this.selectedIndexList.map((index) => this.imageTagList[index])
      );
    this.addImageTagToSelectedImageListModalAddedImageTagList = [];
  }

  public onAddImageTagToSelectedImageListModalImageTagAdded(
    addedImageTag: ImageTag
  ): void {
    this.addImageTagToSelectedImageListModalAddedImageTagList = [
      ...this.addImageTagToSelectedImageListModalAddedImageTagList,
      addedImageTag,
    ];
  }

  public onAddImageTagToSelectedImageListModalImageTagDeleted(
    deletedImageTag: ImageTag
  ): void {
    this.addImageTagToSelectedImageListModalAddedImageTagList =
      this.addImageTagToSelectedImageListModalAddedImageTagList.filter(
        (imageTag) => imageTag.id !== deletedImageTag.id
      );
  }

  public async onAddImageTagToSelectedImageListModalOk(): Promise<void> {
    const selectedImageIDList = this.selectedIndexList.map(
      (index) => this.imageList[index].id
    );
    const addedImageTagIDList =
      this.addImageTagToSelectedImageListModalAddedImageTagList.map(
        (imageTag) => imageTag.id
      );
    try {
      await this.imageListManagementService.addImageTagListToImageList(
        selectedImageIDList,
        addedImageTagIDList
      );
      this.notificationService.success(
        'Added image tags to selected image(s) successfully',
        ''
      );
      this.isAddImageTagToSelectedImageListModalVisible = false;
      await this.getImageListFromPaginationInfo();
    } catch (e) {
      this.handleError('Failed to add image tags to selected image(s)', e);
    }
  }

  public onAddImageTagToSelectedImageListModalCancel(): void {
    this.isAddImageTagToSelectedImageListModalVisible = false;
  }

  public onDeleteSelectedImagesClicked(): void {
    const selectedImageIDList = this.selectedIndexList.map(
      (index) => this.imageList[index].id
    );
    this.modalService.create({
      nzTitle: 'Delete selected image(s)',
      nzContent:
        'Are you sure? This will also delete all region extracted from them. ' +
        'This action is <b>IRREVERSIBLE</b>.',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await this.imageListManagementService.deleteImageList(
            selectedImageIDList
          );
          await this.getImageListFromPaginationInfo();
          this.notificationService.success(
            'Delete selected image(s) successfully',
            ''
          );
        } catch (e) {
          this.handleError('Failed to delete selected image(s)', e);
        }
      },
    });
  }

  public async onRequestRegionDetectionForSelectedImagesClicked() {
    const selectedImageIDList = this.selectedIndexList.map(
      (index) => this.imageList[index].id
    );
    this.modalService.create({
      nzTitle: 'Request for lesion suggestion for selected image(s)',
      nzContent: 'Are you sure?',
      nzOnOk: async () => {
        try {
          await this.imageListManagementService.createImageDetectionTaskList(
            selectedImageIDList
          );
          await this.getImageListFromPaginationInfo();
          this.notificationService.success(
            'Requested for lesion suggestion for selected image(s) successfully',
            ''
          );
        } catch (e) {
          this.handleError(
            'Failed to requested for lesion suggestion for selected image(s)',
            e
          );
        }
      },
    });
  }

  public async onRequestClassificationForSelectedImagesClicked(classificationTypeInx: number) {
    const selectedImageIDList = this.selectedIndexList.map(
      (index) => this.imageList[index].id
    );
    this.modalService.create({
      nzTitle: `Request for ${this.classificationTypeList[classificationTypeInx].displayName} classification for selected image(s)`,
      nzContent: 'Are you sure?',
      nzOnOk:async () => {
        try {
          const selectedClassificationTypeId = this.classificationTypeList[classificationTypeInx].id;
          await this.imageListManagementService.createImageClassificationTaskList(
            selectedImageIDList,
            selectedClassificationTypeId,
          );
          await this.getImageListFromPaginationInfo();
          this.notificationService.success(
            `Request for ${this.classificationTypeList[classificationTypeInx].displayName} classification for selected image(s) successfully`,
            ''
          );
        } catch (e) {
          this.handleError(
            `Failed to request for ${this.classificationTypeList[classificationTypeInx].displayName} classification for selected image(s)`,
            e
          )
        }
      }
    })
  }

  public onImageDbClicked(imageIndex: number): void {
    const image = this.imageList[imageIndex];
    const filterOptions =
      this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(
        this.filterOptions
      );
    this.router.navigate([`/manage-image/${image.id}`], {
      queryParams: {
        sort: this.imageListSortOption,
        filter: this.jsonCompressService.compress(filterOptions),
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
    if (e instanceof InvalidImageListFilterOptionsError) {
      this.notificationService.error(
        notificationTitle,
        'Invalid image filter options'
      );
      this.location.back();
      return;
    }
    if (e instanceof OneOrMoreImagesNotFoundError) {
      this.notificationService.error(
        notificationTitle,
        'Invalid image filter options'
      );
      return;
    }
    if (e instanceof TooManyImagesError) {
      this.notificationService.error(
        notificationTitle,
        'Too many images selected'
      );
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
