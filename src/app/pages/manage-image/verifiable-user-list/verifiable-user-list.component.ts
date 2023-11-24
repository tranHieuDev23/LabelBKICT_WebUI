import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  User,
  UnauthenticatedError,
  UnauthorizedError,
  ImageNotFoundError,
  UserNotInListError,
  UserAlreadyInListError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

@Component({
  selector: 'app-verifiable-user-list',
  templateUrl: './verifiable-user-list.component.html',
  styleUrls: ['./verifiable-user-list.component.scss'],
})
export class VerifiableUserListComponent {
  private imageID: number | undefined;
  public verifiableUserList: User[] = [];
  public verifiableUserCount = 0;
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
    await this.loadVerifiableUserList(1, 5);
  }

  public async onDeleteClicked(itemIndex: number): Promise<void> {
    if (this.imageID === undefined) {
      return;
    }

    const userId = this.verifiableUserList[itemIndex].id;
    try {
      await this.imageManagementService.removeVerifiableUserOfImage(this.imageID, userId);
      this.notificationService.success('Deleted verifiable user of image successfully', '');
    } catch (e) {
      this.handleError('Failed to delete verifiable user of image', e);
      return;
    }

    await this.loadVerifiableUserList(this.pageIndex, this.pageSize);
  }

  public async onPageIndexChanged(newPageIndex: number): Promise<void> {
    await this.loadVerifiableUserList(newPageIndex, this.pageSize);
  }

  private async loadVerifiableUserList(pageIndex: number, pageSize: number): Promise<void> {
    if (this.imageID === undefined) {
      return;
    }

    try {
      const { totalUserCount, userList } = await this.imageManagementService.getVerifiableUsersOfImage(
        this.imageID,
        this.paginationService.getPageOffset(pageIndex, pageSize),
        pageSize
      );
      this.verifiableUserCount = totalUserCount;
      this.verifiableUserList = userList;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;

      if (userList.length === 0 && totalUserCount > 0) {
        const lastPageIndex = this.paginationService.getLastPageIndex(totalUserCount, pageSize);
        return await this.loadVerifiableUserList(lastPageIndex, pageSize);
      }
    } catch (e) {
      this.handleError('Failed to load verifiable user list of image', e);
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
      this.notificationService.error(notificationTitle, 'User is not in the verifiable user list');
      this.loadVerifiableUserList(this.pageIndex, this.pageSize);
      return;
    }
    if (e instanceof UserAlreadyInListError) {
      this.notificationService.error(notificationTitle, 'User is already in the verifiable user list');
      this.loadVerifiableUserList(this.pageIndex, this.pageSize);
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
