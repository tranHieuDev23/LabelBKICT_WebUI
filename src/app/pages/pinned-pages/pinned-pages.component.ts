import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  InvalidPinnedPageListArgument,
  PinnedPage,
  PinnedPageNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { PinnedPageManagementService } from 'src/app/services/module/pinned-page-management/pinned-page-management.service';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-pinned-pages',
  templateUrl: './pinned-pages.component.html',
  styleUrls: ['./pinned-pages.component.scss'],
})
export class PinnedPagesComponent implements OnInit {
  public pageIndex = DEFAULT_PAGE_INDEX;
  public pageSize = DEFAULT_PAGE_SIZE;
  public totalPinnedPageCount = 0;
  public pinnedPageList: PinnedPage[] = [];

  constructor(
    private readonly pinnedPageManagementService: PinnedPageManagementService,
    private readonly paginationService: PaginationService,
    private readonly notificationService: NzNotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      async (params) => await this.onQueryParamsChanged(params)
    );
  }

  private async onQueryParamsChanged(params: Params): Promise<void> {
    if (params['page'] !== undefined) {
      this.pageIndex = +params['page'];
    } else {
      this.pageIndex = DEFAULT_PAGE_INDEX;
    }
    if (params['size'] !== undefined) {
      this.pageSize = +params['size'];
    } else {
      this.pageSize = DEFAULT_PAGE_SIZE;
    }
    await this.getPinnedPageListFromPaginationInfo();
  }

  private async getPinnedPageListFromPaginationInfo(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.pageIndex,
      this.pageSize
    );
    try {
      const { totalPinnedPageCount, pinnedPageList } =
        await this.pinnedPageManagementService.getPinnedPageList(
          offset,
          this.pageSize
        );
      this.totalPinnedPageCount = totalPinnedPageCount;
      this.pinnedPageList = pinnedPageList;
    } catch (e) {
      if (e instanceof InvalidPinnedPageListArgument) {
        this.notificationService.error(
          'Failed to load pinned page list',
          'Invalid page arguments'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to load pinned page list',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else {
        this.notificationService.error(
          'Failed to load pinned page list',
          'Unknown error'
        );
      }
    }
  }

  public async onPinnedPageDescriptionChanged(
    pinnedPageIndex: number,
    newDescription: string
  ): Promise<void> {
    const pinnedPage = this.pinnedPageList[pinnedPageIndex];
    try {
      const updatedPinnedPage =
        await this.pinnedPageManagementService.updatePinnedPage(
          pinnedPage.id,
          newDescription
        );
      this.notificationService.success('Updated pinned page successfully', '');
      this.pinnedPageList[pinnedPageIndex] = updatedPinnedPage;
      this.pinnedPageList = [...this.pinnedPageList];
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update pinned page',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update pinned page',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof PinnedPageNotFoundError) {
        this.notificationService.error(
          'Failed to update pinned page',
          'Cannot find pinned page'
        );
      } else {
        this.notificationService.error(
          'Failed to update pinned page',
          'Unknown error'
        );
      }
    }
  }

  public async onDeletePinnedPageClicked(
    pinnedPageIndex: number
  ): Promise<void> {
    const pinnedPage = this.pinnedPageList[pinnedPageIndex];
    try {
      await this.pinnedPageManagementService.deletePinnedPage(pinnedPage.id);
      this.notificationService.success('Deleted pinned page successfully', '');
      await this.getPinnedPageListFromPaginationInfo();
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to delete pinned page',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to delete pinned page',
          'User does not have the required permission'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof PinnedPageNotFoundError) {
        this.notificationService.error(
          'Failed to delete pinned page',
          'Cannot find pinned page'
        );
      } else {
        this.notificationService.error(
          'Failed to delete pinned page',
          'Unknown error'
        );
      }
    }
  }

  public onPageIndexChanged(newPageIndex: number): void {
    this.navigateToPage(newPageIndex, this.pageSize);
  }

  public onPageSizeChanged(newPageSize: number): void {
    this.navigateToPage(this.pageIndex, newPageSize);
  }

  private navigateToPage(pageIndex: number, pageSize: number): void {
    this.router.navigate(['/pinned-pages'], {
      queryParams: {
        page: pageIndex,
        size: pageSize,
      },
    });
  }
}
