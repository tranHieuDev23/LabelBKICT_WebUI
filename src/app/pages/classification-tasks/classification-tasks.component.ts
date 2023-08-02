import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ClassificationTask,
  ClassificationTaskListSortOption,
  ClassificationType,
  ImageListFilterOptionsWithMetadata,
  ImageListSortOption,
  UnauthenticatedError,
  UnauthorizedError,
  User,
} from 'src/app/services/dataaccess/api';
import { 
  ClassificationTypeManagementService
} from 'src/app/services/module/classification-type-management';
import { FilterOptionsService, ImageListManagementService } from 'src/app/services/module/image-list-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT_OPTION = ClassificationTaskListSortOption.REQUEST_TIME_DESCENDING;
const MAX_SEARCH_USER_RESULT = 10;

@Component({
  selector: 'app-classification-tasks',
  templateUrl: './classification-tasks.component.html',
  styleUrls: ['./classification-tasks.component.scss'],
})
export class ClassificationTasksComponent implements OnInit {
  public pageIndex: number = DEFAULT_PAGE_INDEX;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public filterOptions: ImageListFilterOptionsWithMetadata = this.getDefaultImageListFilterOptions();
  public classificationTaskListSortOption = DEFAULT_SORT_OPTION;

  public uploadedByUserOptionList: User[] = [];
  public publishedByUserOptionList: User[] = [];
  public verifiedByUserOptionList: User[] = [];

  public fromClassificationTaskIndex: number = 0;
  public toClassificationTaskIndex: number = 0;
  public totalClassificationTaskCount: number = 0;
  public classificationTaskList: ClassificationTask[] = [];
  public isLoadingClassificationTaskList: boolean = false;

  public classificationTypeList: ClassificationType[] = [];

  private getDefaultImageListFilterOptions(): ImageListFilterOptionsWithMetadata {
    const filterOptions = new ImageListFilterOptionsWithMetadata();
    return filterOptions;
  }

  constructor(
    private readonly imageListManagementService: ImageListManagementService,
    private readonly classificationTypeManagementService: ClassificationTypeManagementService,
    private readonly filterOptionsService: FilterOptionsService,
    private readonly userManagementService: UserManagementService,
    private readonly paginationService: PaginationService,
    private readonly jsonCompressService: JSONCompressService,
    private readonly notificationService: NzNotificationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
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
      this.classificationTaskListSortOption = +queryParams['sort'];
    } else {
      this.classificationTaskListSortOption = DEFAULT_SORT_OPTION;
    }
    if (queryParams['filter'] !== undefined) {
      this.filterOptions = this.jsonCompressService.decompress(queryParams['filter']);
    } else {
      this.filterOptions = this.getDefaultImageListFilterOptions();
    }
  }

  private async getImageListFromPaginationInfo(): Promise<void> {
    this.isLoadingClassificationTaskList = true;
    const offset = this.paginationService.getPageOffset(this.pageIndex, this.pageSize);
    const filterOptions = this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(this.filterOptions);
    try {
      const { totalClassificationTaskCount, classificationTaskList } =
        await this.imageListManagementService.getImageClassificationTaskList(
          offset,
          this.pageSize,
          this.classificationTaskListSortOption,
          filterOptions
        );
      const classificationTypeList = await this.classificationTypeManagementService.getClassificationTypeList();
      this.classificationTypeList = classificationTypeList;
      this.totalClassificationTaskCount = totalClassificationTaskCount;
      this.classificationTaskList = classificationTaskList;
      this.fromClassificationTaskIndex = offset + 1;
      this.toClassificationTaskIndex = offset + classificationTaskList.length;
    } catch (e) {
      this.handleError('Failed to get image list', e);
    } finally {
      this.isLoadingClassificationTaskList = false;
    }
  }

  public getClassificationTypeDisplayName(id: number): string {
    return this.classificationTypeList.filter((item) => item.id === id)[0].displayName;
  }

  public async onUploadedByUserSearch(query: string): Promise<void> {
    query = query.trim();
    if (query === '') {
      this.uploadedByUserOptionList = [];
    } else {
      this.uploadedByUserOptionList = await this.imageListManagementService.searchUserManageableImageUserList(
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
    this.navigateToPage(this.pageIndex, this.pageSize, this.classificationTaskListSortOption, filterOptions);
  }

  public onImageListSortOptionUploaded(sortOption: ClassificationTaskListSortOption): void {
    this.navigateToPage(this.pageIndex, this.pageSize, sortOption, this.filterOptions);
  }

  public onPageIndexChanged(newPageIndex: number): void {
    this.navigateToPage(newPageIndex, this.pageSize, this.classificationTaskListSortOption, this.filterOptions);
  }

  public onPageSizeChanged(newPageSize: number): void {
    this.navigateToPage(this.pageIndex, newPageSize, this.classificationTaskListSortOption, this.filterOptions);
  }

  private navigateToPage(
    pageIndex: number,
    pageSize: number,
    sortOption: ClassificationTaskListSortOption,
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
    this.router.navigate(['/classification-tasks'], { queryParams });
  }

  public onClassificationTaskImageDbClicked(index: number): void {
    const image = this.classificationTaskList[index].ofImage;
    const filterOptions = this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(this.filterOptions);
    this.router.navigate([`/manage-image/${image.id}`], {
      queryParams: {
        sort: ImageListSortOption.ID_DESCENDING,
        filter: this.jsonCompressService.compress(filterOptions),
      },
    });
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
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
