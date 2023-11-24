import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ImageNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
  User,
  UserAlreadyInListError,
  UserNotInListError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

@Component({
  selector: 'app-manageable-user-list',
  templateUrl: './manageable-user-list.component.html',
  styleUrls: ['./manageable-user-list.component.scss'],
})
export class ManageableUserListComponent {
  private imageID: number | undefined;
  public manageableUserList: { user: User; canEdit: boolean }[] = [];
  public manageableUserCount = 0;
  public pageIndex = 1;
  public pageSize = 5;

  constructor(
    private readonly imageManagementService: ImageManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly paginationService: PaginationService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  public async load(imageID: number): Promise<void> {
    this.imageID = imageID;
    await this.loadManageableUserList(1, 5);
  }

  public async onUserCanEditChanged(itemIndex: number, newCanEdit: boolean): Promise<void> {
    if (this.imageID === undefined) {
      return;
    }

    const userId = this.manageableUserList[itemIndex].user.id;
    try {
      const updatedManageableUser = await this.imageManagementService.updateManageableUserOfImage(
        this.imageID,
        userId,
        newCanEdit
      );

      this.notificationService.success('Updated manageable user of image successfully', '');
      this.manageableUserList[itemIndex] = updatedManageableUser;
      this.manageableUserList = [...this.manageableUserList];
    } catch (e) {
      this.handleError('Failed to update manageable user of image', e);
    }
  }

  public async onDeleteClicked(itemIndex: number): Promise<void> {
    if (this.imageID === undefined) {
      return;
    }

    const userId = this.manageableUserList[itemIndex].user.id;
    try {
      await this.imageManagementService.removeManageableUserOfImage(this.imageID, userId);
      this.notificationService.success('Deleted manageable user of image successfully', '');
    } catch (e) {
      this.handleError('Failed to delete manageable user of image', e);
      return;
    }

    await this.loadManageableUserList(this.pageIndex, this.pageSize);
  }

  public async onPageIndexChanged(newPageIndex: number): Promise<void> {
    await this.loadManageableUserList(newPageIndex, this.pageSize);
  }

  private async loadManageableUserList(pageIndex: number, pageSize: number): Promise<void> {
    if (this.imageID === undefined) {
      return;
    }

    try {
      const { totalUserCount, userList } = await this.imageManagementService.getManageableUsersOfImage(
        this.imageID,
        this.paginationService.getPageOffset(pageIndex, pageSize),
        pageSize
      );
      this.manageableUserCount = totalUserCount;
      this.manageableUserList = userList;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;

      if (userList.length === 0 && totalUserCount > 0) {
        const lastPageIndex = this.paginationService.getLastPageIndex(totalUserCount, pageSize);
        return await this.loadManageableUserList(lastPageIndex, pageSize);
      }
    } catch (e) {
      this.handleError('Failed to load manageable user list of image', e);
      this.location.back();
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
      this.notificationService.error(notificationTitle, 'Image not found');
      this.location.back();
      return;
    }
    if (e instanceof UserNotInListError) {
      this.notificationService.error(notificationTitle, 'User is not in the manageable user list');
      this.loadManageableUserList(this.pageIndex, this.pageSize);
      return;
    }
    if (e instanceof UserAlreadyInListError) {
      this.notificationService.error(notificationTitle, 'User is already in the manageable user list');
      this.loadManageableUserList(this.pageIndex, this.pageSize);
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
