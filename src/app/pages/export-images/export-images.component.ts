import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ImageListFilterOptionsWithMetadata } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.component';
import {
  User,
  Image,
  ImageTag,
  InvalidImageListFilterOptionsError,
  UnauthenticatedError,
  UnauthorizedError,
  ImageListSortOption,
  ExportType,
  Export,
  InvalidExportListArgument,
  ExportNotFoundError,
  ExportStatus,
  ImageStatus,
} from 'src/app/services/dataaccess/api';
import { ExportManagementService } from 'src/app/services/module/export-management/export-management.service';
import {
  ImageListManagementService,
  FilterOptionsService,
} from 'src/app/services/module/image-list-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_IMAGE_PAGE_INDEX = 1;
const DEFAULT_IMAGE_PAGE_SIZE = 12;
const DEFAULT_IMAGE_SORT_OPTION = ImageListSortOption.UPLOAD_TIME_DESCENDING;
const MAX_SEARCH_USER_RESULT = 10;

const DEFAULT_EXPORT_PAGE_INDEX = 1;
const DEFAULT_EXPORT_PAGE_SIZE = 10;

@Component({
  selector: 'app-export-images',
  templateUrl: './export-images.component.html',
  styleUrls: ['./export-images.component.scss'],
})
export class ExportImagesComponent implements OnInit {
  @ViewChild('contextMenu') public contextMenu:
    | NzDropdownMenuComponent
    | undefined;

  public imagePageIndex: number = DEFAULT_IMAGE_PAGE_INDEX;
  public imagePageSize: number = DEFAULT_IMAGE_PAGE_SIZE;
  public filterOptions: ImageListFilterOptionsWithMetadata =
    this.getDefaultImageListFilterOptions();
  public imageListSortOption = DEFAULT_IMAGE_SORT_OPTION;

  public uploadedByUserOptionList: User[] = [];
  public publishedByUserOptionList: User[] = [];
  public verifiedByUserOptionList: User[] = [];

  public fromImageIndex: number = 0;
  public toImageIndex: number = 0;
  public totalImageCount: number = 0;
  public imageList: Image[] = [];
  public imageTagList: ImageTag[][] = [];
  public isLoadingImageList: boolean = false;

  public exportPageIndex: number = DEFAULT_EXPORT_PAGE_INDEX;
  public exportPageSize: number = DEFAULT_EXPORT_PAGE_SIZE;
  public totalExportCount: number = 0;
  public exportList: Export[] = [];
  public isLoadingExportList: boolean = false;

  private getDefaultImageListFilterOptions(): ImageListFilterOptionsWithMetadata {
    const filterOptions = new ImageListFilterOptionsWithMetadata();
    filterOptions.imageStatusList = [ImageStatus.VERIFIED];
    return filterOptions;
  }

  constructor(
    private readonly imageListManagementService: ImageListManagementService,
    private readonly exportManagementService: ExportManagementService,
    private readonly filterOptionsService: FilterOptionsService,
    private readonly userManagementService: UserManagementService,
    private readonly paginationService: PaginationService,
    private readonly jsonCompressService: JSONCompressService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
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
      this.imagePageIndex = +queryParams['index'];
    } else {
      this.imagePageIndex = DEFAULT_IMAGE_PAGE_INDEX;
    }
    if (queryParams['size'] !== undefined) {
      this.imagePageSize = +queryParams['size'];
    } else {
      this.imagePageSize = DEFAULT_IMAGE_PAGE_SIZE;
    }
    if (queryParams['sort'] !== undefined) {
      this.imageListSortOption = +queryParams['sort'];
    } else {
      this.imageListSortOption = DEFAULT_IMAGE_SORT_OPTION;
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
      this.imagePageIndex,
      this.imagePageSize
    );
    const filterOptions =
      this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(
        this.filterOptions
      );
    try {
      const { totalImageCount, imageList, imageTagList } =
        await this.imageListManagementService.getUserExportableImageList(
          offset,
          this.imagePageSize,
          this.imageListSortOption,
          filterOptions
        );
      this.totalImageCount = totalImageCount;
      this.imageList = imageList;
      this.imageTagList = imageTagList;
      this.fromImageIndex = offset + 1;
      this.toImageIndex = offset + imageList.length;
    } catch (e) {
      if (e instanceof InvalidImageListFilterOptionsError) {
        this.notificationService.error(
          'Failed to get image list',
          'Invalid image filter options'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to get image list',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to get image list',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to get image list',
          'Unknown error'
        );
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
      this.uploadedByUserOptionList =
        await this.imageListManagementService.searchUserExportableImageUserList(
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
      this.imagePageIndex,
      this.imagePageSize,
      this.imageListSortOption,
      filterOptions
    );
  }

  public onImageListSortOptionUploaded(sortOption: ImageListSortOption): void {
    this.navigateToPage(
      this.imagePageIndex,
      this.imagePageSize,
      sortOption,
      this.filterOptions
    );
  }

  public onImagePageIndexChanged(newPageIndex: number): void {
    this.navigateToPage(
      newPageIndex,
      this.imagePageSize,
      this.imageListSortOption,
      this.filterOptions
    );
  }

  public onImagePageSizeChanged(newPageSize: number): void {
    this.navigateToPage(
      this.imagePageIndex,
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
    if (pageIndex !== DEFAULT_IMAGE_PAGE_INDEX) {
      queryParams['index'] = pageIndex;
    }
    if (pageSize !== DEFAULT_IMAGE_PAGE_SIZE) {
      queryParams['size'] = pageSize;
    }
    if (sortOption !== DEFAULT_IMAGE_SORT_OPTION) {
      queryParams['sort'] = sortOption;
    }
    queryParams['filter'] = this.jsonCompressService.compress(filterOptions);
    this.router.navigate(['/export-images'], { queryParams });
  }

  public async onRequestDatasetZipClicked(): Promise<void> {
    await this.requestExport(ExportType.DATASET);
  }

  public async onRequestDatasetExcelClicked(): Promise<void> {
    await this.requestExport(ExportType.EXCEL);
  }

  private async requestExport(type: ExportType): Promise<void> {
    const filterOptions =
      this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(
        this.filterOptions
      );
    try {
      await this.exportManagementService.createExport(type, filterOptions);
    } catch (e) {
      console.log(e);
      if (e instanceof InvalidImageListFilterOptionsError) {
        this.notificationService.error(
          'Failed to request export',
          'Invalid image filter options'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to request export',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to request export',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to request export',
          'Unknown error'
        );
      }
      return;
    }
    this.notificationService.success(
      'Export requested successfully',
      'Check the status of your export in <b>My exports</b> tab'
    );
  }

  public async onMyExportsTabSelected(): Promise<void> {
    await this.getExportListFromPaginationInfo();
  }

  public async onReloadExportListClicked(): Promise<void> {
    await this.getExportListFromPaginationInfo();
  }

  public async onExportPageIndexChanged(newPageIndex: number): Promise<void> {
    this.exportPageIndex = newPageIndex;
    await this.getExportListFromPaginationInfo();
  }

  public async onExportPageSizeChanged(newPageSize: number): Promise<void> {
    this.exportPageIndex = newPageSize;
    await this.getExportListFromPaginationInfo();
  }

  private async getExportListFromPaginationInfo(): Promise<void> {
    this.isLoadingExportList = true;
    this.totalImageCount = 0;
    this.exportList = [];
    const offset = this.paginationService.getPageOffset(
      this.exportPageIndex,
      this.exportPageSize
    );
    try {
      const { totalExportCount, exportList } =
        await this.exportManagementService.getExportList(
          offset,
          this.imagePageSize
        );
      this.totalExportCount = totalExportCount;
      this.exportList = exportList;
    } catch (e) {
      if (e instanceof InvalidExportListArgument) {
        this.notificationService.error(
          'Failed to get export list',
          'Invalid export list arguments'
        );
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to get export list',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to get export list',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to get export list',
          'Unknown error'
        );
      }
      return;
    } finally {
      this.isLoadingExportList = false;
    }
  }

  public async onDownloadExportClicked(exportRequest: Export): Promise<void> {
    if (exportRequest.status !== ExportStatus.DONE) {
      return;
    }
    await this.exportManagementService.getExportFile(exportRequest.id);
  }

  public onDeleteExportClicked(exportRequest: Export): void {
    this.modalService.warning({
      nzTitle: 'Delete export',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOnOk: async () => {
        try {
          await this.exportManagementService.deleteExport(exportRequest.id);
        } catch (e) {
          if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to delete export',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to delete export',
              'User does not have the required permission'
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof ExportNotFoundError) {
            this.notificationService.error(
              'Failed to delete export',
              'Export not found'
            );
            await this.getExportListFromPaginationInfo();
          } else {
            this.notificationService.error(
              'Failed to delete export',
              'Unknown error'
            );
          }
          return;
        }
        this.notificationService.success('Deleted export successfully', '');
        await this.getExportListFromPaginationInfo();
      },
    });
  }
}
