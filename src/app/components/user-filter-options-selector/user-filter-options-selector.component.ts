import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RolesService, TagsService, UnauthenticatedError, UnauthorizedError, UserRole, UserRoleListSortOrder, UserTag, UserTagListSortOrder } from "src/app/services/dataaccess/api";
import { DelayedCallbackService } from 'src/app/services/utils/delayed-callback/delayed-callback.service';
import { PaginationService } from "src/app/services/utils/pagination/pagination.service";

export class UserListFilterOptionsWithMetadata {
  public userNameQuery = '';
  public userTagList: UserTag[] = [];
  public userRoleList: UserRole[] = [];
}

const USER_SEARCH_INPUT_CALLBACK_ID = 'USER_SEARCH_DELAYED_CALLBACK_ID';
const USER_SEARCH_INPUT_CALLBACK_DELAY = 1000;
const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_ROLE_LIST_SORT_ORDER = UserRoleListSortOrder.ID_ASCENDING;
const DEFAULT_TAG_LIST_SORT_ORDER = UserTagListSortOrder.ID_ASCENDING;

@Component({
  selector: 'app-user-filter-options-selector',
  templateUrl: './user-filter-options-selector.component.html',
  styleUrls: ['./user-filter-options-selector.component.scss'],
})

export class UserFilterOptionsSelectorComponent implements OnInit {
  private _filterOptions = new UserListFilterOptionsWithMetadata();

  @Input() public set filterOptions(v: UserListFilterOptionsWithMetadata) {
    this._filterOptions = v;
  }

  public get filterOptions(): UserListFilterOptionsWithMetadata {
    return this._filterOptions;
  }
  
  @Output() public filterOptionsUpdated =
    new EventEmitter<UserListFilterOptionsWithMetadata>();

  public userTagList: UserTag[] = [];
  public userRoleList: UserRole[] = [];

  public sameIDCompareFunc = (o1: any, o2: any) => {
    return o1?.id === o2?.id;
  };
  
  constructor(
    private readonly rolesService: RolesService,
    private readonly tagsService: TagsService,
    private readonly notificationService: NzNotificationService,
    private readonly paginationService: PaginationService,
    private readonly delayedCallbackService: DelayedCallbackService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      try {
        const offset = this.paginationService.getPageOffset(
          DEFAULT_PAGE_INDEX,
          DEFAULT_PAGE_SIZE
        );
        const { totalUserRoleCount, userRoleList, userPermissionList } =
          await this.rolesService.getUserRoleList(
            offset,
            DEFAULT_PAGE_SIZE,
            DEFAULT_ROLE_LIST_SORT_ORDER,
            false
          );
        this.userRoleList = userRoleList;

        const { totalUserTagCount, userTagList } =
          await this.tagsService.getUserTagList(
            offset,
            DEFAULT_PAGE_SIZE,
            DEFAULT_TAG_LIST_SORT_ORDER
          );
        this.userTagList = userTagList;
      } catch (e) {
        if (e instanceof UnauthenticatedError) {
          this.notificationService.error(
            'Failed to load page',
            'User is not logged in'
          );
          this.router.navigateByUrl('/login');
        } else if (e instanceof UnauthorizedError) {
          this.notificationService.error(
            'Failed to load page',
            'User does not have the required permission'
          );
          this.router.navigateByUrl('/welcome');
        } else {
          this.notificationService.error(
            'Failed to load page',
            'Unknown error'
          );
          this.router.navigateByUrl('/welcome');
        }
      }
    })().then();
  }

  public onFilterOptionsUpdated(): void {
    this.filterOptionsUpdated.emit(this._filterOptions);
  }
  
  public resetFilterOptions(): void {
    this._filterOptions = new UserListFilterOptionsWithMetadata();
    this.onFilterOptionsUpdated();
  }

  public onUsernameInputChanged(): void {
    this.delayedCallbackService.scheduleDelayedCallback(
      USER_SEARCH_INPUT_CALLBACK_ID,
      () => {
      this.onFilterOptionsUpdated();
      },
      USER_SEARCH_INPUT_CALLBACK_DELAY
    );
  }
}



