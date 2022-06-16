import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ImageFilterOptionsSelectorConfig,
  ImageListFilterOptionsWithMetadata,
} from 'src/app/components/image-filter-options-selector/image-filter-options-selector.component';
import {
  Image,
  ImageListSortOption,
  ImageTag,
  ImageType,
  ImageTypesService,
  InvalidImageListFilterOptionsError,
  OneOrMoreImagesNotFoundError,
  TooManyImagesError,
  UnauthenticatedError,
  UnauthorizedError,
  User,
} from 'src/app/services/dataaccess/api';
import {
  FilterOptionsService,
  ImageListManagementService,
} from 'src/app/services/module/image-list-management';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT_OPTION = ImageListSortOption.UPLOAD_TIME_DESCENDING;
const MAX_SEARCH_USER_RESULT = 10;

@Component({
  selector: 'app-my-images',
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.scss'],
})
export class MyImagesComponent implements OnInit {
  @ViewChild('contextMenu') public contextMenu:
    | NzDropdownMenuComponent
    | undefined;

  public pageIndex: number = DEFAULT_PAGE_INDEX;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public filterOptions: ImageListFilterOptionsWithMetadata =
    this.getDefaultImageListFilterOptions();
  public imageListSortOption = DEFAULT_SORT_OPTION;

  public publishedByUserOptionList: User[] = [];
  public verifiedByUserOptionList: User[] = [];

  public fromImageIndex: number = 0;
  public toImageIndex: number = 0;
  public totalImageCount: number = 0;
  public imageList: Image[] = [];
  public imageTagList: ImageTag[][] = [];
  public isLoadingImageList: boolean = false;

  public imageListFilterOptionsSelectorConfig =
    new ImageFilterOptionsSelectorConfig();

  private getDefaultImageListFilterOptions(): ImageListFilterOptionsWithMetadata {
    const filterOptions = new ImageListFilterOptionsWithMetadata();
    return filterOptions;
  }

  public imageTypeList: ImageType[] = [];

  private selectedImageList: Image[] = [];

  constructor(
    private readonly imageManagementService: ImageManagementService,
    private readonly imageListManagementService: ImageListManagementService,
    private readonly filterOptionsService: FilterOptionsService,
    private readonly userManagementService: UserManagementService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly imageTypesService: ImageTypesService,
    private readonly paginationService: PaginationService,
    private readonly jsonCompressService: JSONCompressService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly notificationService: NzNotificationService,
    private readonly contextMenuService: NzContextMenuService,
    private readonly modalService: NzModalService
  ) {
    this.imageListFilterOptionsSelectorConfig.canFilterUploadedByUser = false;
  }

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
        await this.imageListManagementService.getUserImageList(
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
    this.router.navigate(['/my-images'], { queryParams });
  }

  public onImageGridImageListSelected(imageList: Image[]): void {
    this.selectedImageList = imageList;
  }

  public onImageGridContextMenu(event: MouseEvent): boolean {
    if (this.selectedImageList.length === 0) {
      return false;
    }
    (async () => {
      if (this.imageTypeList.length === 0) {
        try {
          const { imageTypeList } =
            await this.imageTypesService.getImageTypeList(false);
          this.imageTypeList = imageTypeList;
        } catch (e) {
          this.handleError('Failed to get image type list', e);
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
    const selectedImageIDList = this.selectedImageList.map((image) => image.id);
    this.modalService.create({
      nzTitle: 'Change image type of image(s)',
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
            'Changed image type of image(s) successfully',
            ''
          );
        } catch (e) {
          this.handleError('Failed to change image type of image(s)', e);
        }
      },
    });
  }

  public onDeleteSelectedImagesClicked(): void {
    const selectedImageIDList = this.selectedImageList.map((image) => image.id);
    this.modalService.create({
      nzTitle: 'Delete image(s)',
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
          this.notificationService.success('Delete image(s) successfully', '');
        } catch (e) {
          this.handleError('Failed to delete image(s)', e);
        }
      },
    });
  }

  public async onSelectedImageRequestDetectionClicked() {
    const selectedImageIDList = this.selectedImageList.map((image) => image.id);
    this.modalService.create({
      nzTitle: 'Request for region detection for selected image(s)',
      nzContent:
        'Are you sure? This will also delete all previously region extracted from them and request for region detection again. ' +
        'This action is <b>IRREVERSIBLE</b>.',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await this.imageManagementService.createDetectionTaskImageList(
            selectedImageIDList
          );
          await this.getImageListFromPaginationInfo();
          this.notificationService.success(
            'Requested for region detection for image(s) successfully',
            ''
          );
        } catch (e) {
          this.handleError(
            'Failed to requested for region detection for image(s)',
            e
          );
        }
      },
    });
  }

  public async onImageDbClicked(imageIndex: number): Promise<void> {
    const authUserInfo =
      await this.sessionManagementService.getUserFromSession();
    if (authUserInfo === null) {
      this.notificationService.error(
        'Failed to load image',
        'User is not logged in'
      );
      this.router.navigateByUrl('/login');
      return;
    }

    const image = this.imageList[imageIndex];
    const filterOptions =
      this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(
        this.filterOptions
      );
    filterOptions.uploadedByUserIDList = [authUserInfo.user.id];
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
