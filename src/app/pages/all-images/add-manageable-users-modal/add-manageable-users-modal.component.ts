import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserSearchBoxComponent } from 'src/app/components/user-search-box/user-search-box.component';
import {
  ImageOrUserNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
  User,
  UserCannotBeAddedToManageableUserListError,
} from 'src/app/services/dataaccess/api';
import { ImageListManagementService } from 'src/app/services/module/image-list-management';

@Component({
  selector: 'app-add-manageable-users-modal',
  templateUrl: './add-manageable-users-modal.component.html',
  styleUrls: ['./add-manageable-users-modal.component.scss'],
})
export class AddManageableUsersModalComponent {
  @ViewChild(UserSearchBoxComponent, { static: false })
  public userSearchBox: UserSearchBoxComponent | undefined;

  public visible = false;
  public userList: User[] = [];
  public canEdit = false;

  private imageIdList: number[] = [];

  constructor(
    private readonly imageListManagementService: ImageListManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router
  ) {}

  public open(imageIdList: number[]): void {
    this.userList = [];
    this.imageIdList = imageIdList;
    this.canEdit = false;
    this.visible = true;
  }

  public close(): void {
    this.visible = false;
  }

  public async onUserSelected(user: User | undefined): Promise<void> {
    if (!user || !this.userSearchBox) {
      return;
    }

    this.userSearchBox.selectedUser = undefined;
    this.userList = [...this.userList, user];
  }

  public async onOk(): Promise<void> {
    this.close();

    const userIdList = this.userList.map((user) => user.id);
    try {
      await this.imageListManagementService.createUserListCanManageImageList(
        userIdList,
        this.imageIdList,
        this.canEdit
      );
      this.notificationService.success('Added user(s) to manageable user list of selected image(s) successfully', '');
    } catch (e) {
      this.handleError('Failed to add user(s) to manageable user list of selected image(s)', e);
    }
  }

  public async onCancel(): Promise<void> {
    this.close();
  }

  private handleError(notificationTitle: string, e: any) {
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
    if (e instanceof ImageOrUserNotFoundError) {
      this.notificationService.error(notificationTitle, 'One or more images or users not found');
      return;
    }
    if (e instanceof UserCannotBeAddedToManageableUserListError) {
      this.notificationService.error(
        notificationTitle,
        'One or more users cannot be added to manageable user list of images'
      );
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
