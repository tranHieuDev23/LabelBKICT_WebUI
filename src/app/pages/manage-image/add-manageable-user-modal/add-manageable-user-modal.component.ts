import { Location } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ImageNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
  User,
  UserAlreadyInListError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';

@Component({
  selector: 'app-add-manageable-user-modal',
  templateUrl: './add-manageable-user-modal.component.html',
  styleUrls: ['./add-manageable-user-modal.component.scss'],
})
export class AddManageableUserModalComponent {
  public visible = false;
  public selectedUser: User | undefined;
  public canEdit = false;

  @Output() manageableUserAdded = new EventEmitter<User>();

  private imageID: number | undefined;

  constructor(
    private readonly imageManagementService: ImageManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  public open(imageID: number): void {
    this.imageID = imageID;
    this.selectedUser = undefined;
    this.canEdit = false;
    this.visible = true;
  }

  public close(): void {
    this.visible = false;
  }

  public async onOk(): Promise<void> {
    if (!this.imageID || !this.selectedUser) {
      return;
    }

    try {
      await this.imageManagementService.addManageableUserToImage(this.imageID, this.selectedUser.id, this.canEdit);
      this.notificationService.success('Added manageable user of image successfully', '');
    } catch (e) {
      this.handleError('Failed to add manageable user of image', e);
      return;
    }

    this.close();
    this.manageableUserAdded.emit(this.selectedUser);
  }

  public onUserSelected(user: User | undefined): void {
    this.selectedUser = user;
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
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image not found');
      this.location.back();
      return;
    }
    if (e instanceof UserAlreadyInListError) {
      this.notificationService.error(notificationTitle, 'User is already in the manageable user list');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
