import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { User } from 'src/app/services/dataaccess/api';
import { UserManagementService } from 'src/app/services/module/user-management';
import { DelayedCallbackService } from 'src/app/services/utils/delayed-callback/delayed-callback.service';

const USER_SEARCH_DELAYED_CALLBACK_ID = 'USER_SEARCH_DELAYED_CALLBACK_ID';
const USER_SEARCH_DELAYED_CALLBACK_DURATION = 500;
const USER_SEARCH_LIMIT = 10;

@Component({
  selector: 'app-user-search-box',
  templateUrl: './user-search-box.component.html',
  styleUrls: ['./user-search-box.component.scss'],
})
export class UserSearchBoxComponent {
  public selectedUser: User | undefined;
  public userOptionList: User[] = [];
  @Output()
  public readonly userSelected = new EventEmitter<User | undefined>();

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly delayedCallbackService: DelayedCallbackService,
    private readonly notificationService: NzNotificationService
  ) {}

  public onSearch(query: string): void {
    if (query === '' || this.selectedUser !== undefined) {
      return;
    }
    this.delayedCallbackService.scheduleDelayedCallback(
      USER_SEARCH_DELAYED_CALLBACK_ID,
      () => {
        this.userManagementService
          .searchUserList(query, USER_SEARCH_LIMIT)
          .then(
            (userList) => {
              this.userOptionList = userList;
            },
            () => {
              this.notificationService.error('Failed to search for user', '');
            }
          );
      },
      USER_SEARCH_DELAYED_CALLBACK_DURATION
    );
  }

  public onModelChange(user: User): void {
    this.userSelected.emit(user);
    if (user !== undefined) {
      this.userOptionList = [];
    }
  }
}
