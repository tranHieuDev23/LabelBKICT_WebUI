import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ImageFilterOptionsSelectorConfig } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.component';
import {
  ImageListSortOption,
  User,
  Image,
  ImageTag,
  InvalidImageListFilterOptionsError,
  UnauthenticatedError,
  UnauthorizedError,
  ImageStatus,
  ImageListFilterOptionsWithMetadata,
  ImageNotFoundError,
} from 'src/app/services/dataaccess/api';
import { ImageListManagementService, FilterOptionsService } from 'src/app/services/module/image-list-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT_OPTION = ImageListSortOption.UPLOAD_TIME_DESCENDING;
const MAX_SEARCH_USER_RESULT = 10;

@Component({
  selector: 'app-verify-images',
  templateUrl: './verify-images.component.html',
  styleUrls: ['./verify-images.component.scss'],
})
export class VerifyImagesComponent implements OnInit {
  @ViewChild('contextMenu') public contextMenu: NzDropdownMenuComponent | undefined;

  public pageIndex: number = DEFAULT_PAGE_INDEX;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public filterOptions: ImageListFilterOptionsWithMetadata = this.getDefaultImageListFilterOptions();
  public imageListSortOption = DEFAULT_SORT_OPTION;

  public uploadedByUserOptionList: User[] = [];
  public publishedByUserOptionList: User[] = [];
  public verifiedByUserOptionList: User[] = [];

  public fromImageIndex: number = 0;
  public toImageIndex: number = 0;
  public totalImageCount: number = 0;
  public imageList: Image[] = [];
  public imageTagList: ImageTag[][] = [];
  public isImageBookmarkedList: boolean[] = [];
  public isLoadingImageList: boolean = false;

  private selectedIndexList: number[] = [];

  public contextMenuIsBookmarkSelectedImagesVisible: boolean = false;
  public contextMenuIsDeleteBookmarksOfSelectedImagesVisible: boolean = false;

  public imageListFilterOptionsSelectorConfig = new ImageFilterOptionsSelectorConfig();

  private getDefaultImageListFilterOptions(): ImageListFilterOptionsWithMetadata {
    const filterOptions = new ImageListFilterOptionsWithMetadata();
    filterOptions.imageStatusList = [ImageStatus.PUBLISHED, ImageStatus.VERIFIED];
    return filterOptions;
  }

  constructor(
    private readonly imageListManagementService: ImageListManagementService,
    private readonly filterOptionsService: FilterOptionsService,
    private readonly userManagementService: UserManagementService,
    private readonly paginationService: PaginationService,
    private readonly jsonCompressService: JSONCompressService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly contextMenuService: NzContextMenuService
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
      this.filterOptions = this.jsonCompressService.decompress(queryParams['filter']);
      this.filterOptions.imageStatusList = this.filterOptions.imageStatusList.filter((imageStatus) => {
        return imageStatus === ImageStatus.PUBLISHED || imageStatus === ImageStatus.VERIFIED;
      });
      if (this.filterOptions.imageStatusList.length === 0) {
        this.filterOptions.imageStatusList = [ImageStatus.PUBLISHED, ImageStatus.VERIFIED];
      }
    } else {
      this.filterOptions = this.getDefaultImageListFilterOptions();
    }
  }

  private async getImageListFromPaginationInfo(): Promise<void> {
    this.isLoadingImageList = true;
    const offset = this.paginationService.getPageOffset(this.pageIndex, this.pageSize);
    const filterOptions = this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(this.filterOptions);
    try {
      const { totalImageCount, imageList, imageTagList, bookmarkedImageIdList } =
        await this.imageListManagementService.getUserVerifiableImageList(
          offset,
          this.pageSize,
          this.imageListSortOption,
          filterOptions
        );
      this.totalImageCount = totalImageCount;
      this.imageList = imageList;
      this.imageTagList = imageTagList;
      this.isImageBookmarkedList = Array<boolean>(imageList.length);
      this.fromImageIndex = offset + 1;
      this.toImageIndex = offset + imageList.length;

      const bookmarkedImageIdSet = new Set(bookmarkedImageIdList);
      this.imageList.forEach((image, i) => {
        this.isImageBookmarkedList[i] = bookmarkedImageIdSet.has(image.id);
      });
    } catch (e) {
      if (e instanceof InvalidImageListFilterOptionsError) {
        this.notificationService.error('Failed to get image list', 'Invalid image filter options');
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error('Failed to get image list', 'User is not logged in');
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error('Failed to get image list', 'User does not have the required permission');
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error('Failed to get image list', 'Unknown error');
      }
    } finally {
      this.isLoadingImageList = false;
    }
  }

  public async onUploadedByUserSearch(query: string): Promise<void> {
    query = query.trim();
    if (query === '') {
      this.uploadedByUserOptionList = [];
    } else {
      this.uploadedByUserOptionList = await this.imageListManagementService.searchUserVerifiableImageUserList(
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
      this.publishedByUserOptionList = await this.userManagementService.searchUserList(query, MAX_SEARCH_USER_RESULT);
    }
  }

  public async onVerifiedByUserSearch(query: string): Promise<void> {
    query = query.trim();
    if (query === '') {
      this.publishedByUserOptionList = [];
    } else {
      this.verifiedByUserOptionList = await this.userManagementService.searchUserList(query, MAX_SEARCH_USER_RESULT);
    }
  }

  public onImageListFilterOptionsUpdated(filterOptions: ImageListFilterOptionsWithMetadata): void {
    this.navigateToPage(this.pageIndex, this.pageSize, this.imageListSortOption, filterOptions);
  }

  public onImageListSortOptionUploaded(sortOption: ImageListSortOption): void {
    this.navigateToPage(this.pageIndex, this.pageSize, sortOption, this.filterOptions);
  }

  public onPageIndexChanged(newPageIndex: number): void {
    this.navigateToPage(newPageIndex, this.pageSize, this.imageListSortOption, this.filterOptions);
  }

  public onPageSizeChanged(newPageSize: number): void {
    this.navigateToPage(this.pageIndex, newPageSize, this.imageListSortOption, this.filterOptions);
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
    this.router.navigate(['/verify-images'], { queryParams });
  }

  public onImageGridImageListSelected(imageIndexList: number[]): void {
    this.selectedIndexList = imageIndexList;
  }

  public onImageDbClicked(imageIndex: number): void {
    const image = this.imageList[imageIndex];
    const filterOptions = this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(this.filterOptions);
    this.router.navigate([`/verify-image/${image.id}`], {
      queryParams: {
        sort: this.imageListSortOption,
        filter: this.jsonCompressService.compress(filterOptions),
      },
    });
  }

  public onImageGridContextMenu(event: MouseEvent): boolean {
    if (this.selectedIndexList.length === 0) {
      return false;
    }

    this.contextMenuIsBookmarkSelectedImagesVisible = false;
    this.contextMenuIsDeleteBookmarksOfSelectedImagesVisible = false;
    for (const index of this.selectedIndexList) {
      if (this.isImageBookmarkedList[index]) {
        this.contextMenuIsDeleteBookmarksOfSelectedImagesVisible = true;
      } else {
        this.contextMenuIsBookmarkSelectedImagesVisible = true;
      }
    }

    if (this.contextMenu) {
      this.contextMenuService.create(event, this.contextMenu);
    }
    return false;
  }

  public async onBookmarkSelectedImagesClicked(): Promise<void> {
    const selectedImageIDList = this.selectedIndexList.map((index) => this.imageList[index].id);
    try {
      await this.imageListManagementService.createEmptyBookmarkForImageList(selectedImageIDList);
      await this.getImageListFromPaginationInfo();
      this.notificationService.success('Bookmarked selected image(s) successfully', '');
    } catch (e) {
      this.handleError('Failed to bookmark selected image(s)', e);
    }
  }

  public async onDeleteBookmarksOfSelectedImagesClicked(): Promise<void> {
    const selectedImageIDList = this.selectedIndexList.map((index) => this.imageList[index].id);
    try {
      await this.imageListManagementService.deleteBookmarkOfImageList(selectedImageIDList);
      await this.getImageListFromPaginationInfo();
      this.notificationService.success('Deleted bookmark(s) of selected image(s) successfully', '');
    } catch (e) {
      this.handleError('Failed to delete bookmark(s) of selected image(s)', e);
    }
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
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(notificationTitle, 'One or more image not found');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
