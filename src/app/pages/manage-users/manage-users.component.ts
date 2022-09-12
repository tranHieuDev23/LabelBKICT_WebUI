import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserListFilterOptionsWithMetadata } from 'src/app/components/user-filter-options-selector/user-filter-options-selector.component';
import {
  InvalidUserInformationError,
  InvalidUserListArgumentError,
  InvalidUserRoleListArgument,
  SameUserError,
  UnauthenticatedError,
  UnauthorizedError,
  User,
  UserAlreadyHasUserRoleError,
  UserAlreadyInListError,
  UserCanManageUserImage,
  UserCanVerifyUserImage,
  UserDoesNotHaveUserRoleError,
  UserListSortOrder,
  UserNotFoundError,
  UserNotInListError,
  UserOrUserRoleNotFoundError,
  UserRole,
  UserRoleListSortOrder,
  UserTag,
  UserTagListSortOrder,
} from 'src/app/services/dataaccess/api';
import { SessionManagementService } from 'src/app/services/module/session-management';
import {
  FilterOptionsService,
  UserManagementService,
} from 'src/app/services/module/user-management';
import { UserRoleManagementService } from 'src/app/services/module/user-role-management';
import { UserTagManagementService } from 'src/app/services/module/user-tag-management';
import { ConfirmedValidator } from 'src/app/services/utils/confirmed-validator/confirmed-validator';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_USER_LIST_PAGE_INDEX = 1;
const DEFAULT_USER_LIST_PAGE_SIZE = 10;
const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ORDER = UserListSortOrder.ID_ASCENDING;

const DEFAULT_USER_CAN_MANAGE_USER_IMAGE_LIST_PAGE_INDEX = 1;
const DEFAULT_USER_CAN_MANAGE_USER_IMAGE_LIST_PAGE_SIZE = 5;

const DEFAULT_USER_CAN_VERIFY_USER_IMAGE_LIST_PAGE_INDEX = 1;
const DEFAULT_USER_CAN_VERIFY_USER_IMAGE_LIST_PAGE_SIZE = 5;

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit {
  public sortOrderOptions: { value: UserListSortOrder; title: string }[] = [
    { value: UserListSortOrder.ID_ASCENDING, title: 'User ID (Asc.)' },
    { value: UserListSortOrder.ID_DESCENDING, title: 'User ID (Desc.)' },
    { value: UserListSortOrder.USERNAME_ASCENDING, title: 'Username (A-Z)' },
    { value: UserListSortOrder.USERNAME_DESCENDING, title: 'Username (Z-A)' },
    {
      value: UserListSortOrder.DISPLAY_NAME_ASCENDING,
      title: 'Display name (A-Z)',
    },
    {
      value: UserListSortOrder.DISPLAY_NAME_DESCENDING,
      title: 'Display name (Z-A)',
    },
  ];
  public pageSizeOptions: number[] = [10, 20, 50, 100];

  public pageIndex: number = DEFAULT_USER_LIST_PAGE_INDEX;
  public pageSize: number = DEFAULT_USER_LIST_PAGE_SIZE;
  public filterOptions: UserListFilterOptionsWithMetadata =
    this.getDefaultUserListFilterOptions();
  public sortOrder: UserListSortOrder = DEFAULT_SORT_ORDER;
  public totalUserCount: number = 0;
  public userList: User[] = [];
  public userRoleList: UserRole[][] = [];
  public userTagList: UserTag[][] = [];

  public isCreateNewUserModalVisible: boolean = false;
  public createNewUserModalFormGroup: FormGroup;

  public isEditUserModalVisible: boolean = false;
  public editUserModalUserListItemIndex: number = 0;
  public editUserModalUserID: number = 0;
  public editUserModalFormGroup: FormGroup;

  public editUserUserCanManageUserImagePageIndex =
    DEFAULT_USER_CAN_MANAGE_USER_IMAGE_LIST_PAGE_INDEX;
  public editUserUserCanManageUserImagePageSize =
    DEFAULT_USER_CAN_MANAGE_USER_IMAGE_LIST_PAGE_SIZE;
  public editUserUserCanManageUserImageCount = 0;
  public editUserUserCanManageUserImageList: UserCanManageUserImage[] = [];

  public isAddUserCanMangeUserImageModalVisible = false;
  public addUserCanMangeUserImageUser: User | undefined;
  public addUserCanMangeUserImageCanEdit = false;

  public editUserUserCanVerifyUserImagePageIndex =
    DEFAULT_USER_CAN_VERIFY_USER_IMAGE_LIST_PAGE_INDEX;
  public editUserUserCanVerifyUserImagePageSize =
    DEFAULT_USER_CAN_VERIFY_USER_IMAGE_LIST_PAGE_SIZE;
  public editUserUserCanVerifyUserImageCount = 0;
  public editUserUserCanVerifyUserImageList: UserCanVerifyUserImage[] = [];

  public isAddUserCanVerifyUserImageModalVisible = false;
  public addUserCanVerifyUserImageUser: User | undefined;

  public isAddUserRoleModalVisible: boolean = false;
  public addUserRoleModalSortOrderOptions: {
    value: UserRoleListSortOrder;
    title: string;
  }[] = [
    {
      value: UserRoleListSortOrder.ID_ASCENDING,
      title: 'User role ID (Asc.)',
    },
    {
      value: UserRoleListSortOrder.ID_DESCENDING,
      title: 'User role ID (Desc.)',
    },
    {
      value: UserRoleListSortOrder.DISPLAY_NAME_ASCENDING,
      title: 'Display name (A-Z)',
    },
    {
      value: UserRoleListSortOrder.DISPLAY_NAME_DESCENDING,
      title: 'Display name (Z-A)',
    },
  ];
  public addUserRoleModalPageSizeOptions: number[] = [10, 20, 50, 100];
  public addUserRoleModalPageIndex: number = 0;
  public addUserRoleModalPageSize: number = 10;
  public addUserRoleModalTotalUserRoleCount: number = 0;
  public addUserRoleModalSortOrder: UserRoleListSortOrder =
    UserRoleListSortOrder.ID_ASCENDING;
  public addUserRoleModalUserRoleList: UserRole[] = [];

  public isAddUserTagModalVisible: boolean = false;
  public addUserTagModalSortOrderOptions: {
    value: UserTagListSortOrder;
    title: string;
  }[] = [
    {
      value: UserTagListSortOrder.ID_ASCENDING,
      title: 'User tag ID (Asc.)',
    },
    {
      value: UserTagListSortOrder.ID_DESCENDING,
      title: 'User tag ID (Desc.)',
    },
    {
      value: UserTagListSortOrder.DISPLAY_NAME_ASCENDING,
      title: 'Display name (A-Z)',
    },
    {
      value: UserTagListSortOrder.DISPLAY_NAME_DESCENDING,
      title: 'Display name (Z-A)',
    },
  ];
  public addUserTagModalPageSizeOptions: number[] = [10, 20, 50, 100];
  public addUserTagModalPageIndex: number = 0;
  public addUserTagModalPageSize: number = 10;
  public addUserTagModalTotalUserTagCount: number = 0;
  public addUserTagModalSortOrder: UserTagListSortOrder =
    UserTagListSortOrder.ID_ASCENDING;
  public addUserTagModalUserTagList: UserTag[] = [];

  private getDefaultUserListFilterOptions(): UserListFilterOptionsWithMetadata {
    const filterOptions = new UserListFilterOptionsWithMetadata();
    return filterOptions;
  }

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly userTagManagementService: UserTagManagementService,
    private readonly filterOptionsService: FilterOptionsService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly userRoleManagementService: UserRoleManagementService,
    private readonly paginationService: PaginationService,
    private readonly jsonCompressService: JSONCompressService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    formBuilder: FormBuilder
  ) {
    this.createNewUserModalFormGroup = formBuilder.group(
      {
        displayName: ['', [Validators.required, this.displayNameValidator()]],
        username: ['', [Validators.required, this.usernameValidator()]],
        password: ['', [Validators.required, this.passwordValidator()]],
        passwordConfirm: ['', [Validators.required]],
      },
      {
        validators: [ConfirmedValidator('password', 'passwordConfirm')],
      }
    );
    this.createNewUserModalFormGroup.reset({
      displayName: '',
      username: '',
      password: '',
      passwordType: '',
    });
    this.editUserModalFormGroup = formBuilder.group(
      {
        displayName: ['', [Validators.required, this.displayNameValidator()]],
        username: ['', [Validators.required, this.usernameValidator()]],
        password: ['', [this.passwordValidator()]],
        passwordConfirm: ['', []],
      },
      {
        validator: [ConfirmedValidator('password', 'passwordConfirm')],
      }
    );
    this.editUserModalFormGroup.reset({
      displayName: '',
      username: '',
      password: '',
      passwordType: '',
    });
  }

  private usernameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const username: string = control.value;
      return this.userManagementService.isValidUsername(username);
    };
  }

  private displayNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const displayName: string = control.value;
      return this.userManagementService.isValidDisplayName(displayName);
    };
  }

  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const password: string = control.value;
      return this.sessionManagementService.isValidPassword(password);
    };
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      this.getPaginationInfoFromQueryParams(params);
      this.loadPageUserList().then(
        () => {},
        (error) => {
          console.error(error);
        }
      );
      const offset = this.paginationService.getPageOffset(
        DEFAULT_PAGE_INDEX,
        DEFAULT_PAGE_SIZE
      );
    });
  }

  private getPaginationInfoFromQueryParams(params: Params): void {
    if (params['page'] !== undefined) {
      this.pageIndex = +params['page'];
    } else {
      this.pageIndex = DEFAULT_USER_LIST_PAGE_INDEX;
    }
    if (params['size'] !== undefined) {
      this.pageSize = +params['size'];
    } else {
      this.pageSize = DEFAULT_USER_LIST_PAGE_SIZE;
    }
    if (params['sort'] !== undefined) {
      this.sortOrder = +params['sort'];
    } else {
      this.sortOrder = DEFAULT_SORT_ORDER;
    }
    if (params['filter'] !== undefined) {
      this.filterOptions = this.jsonCompressService.decompress(
        params['filter']
      );
    } else {
      this.filterOptions = this.getDefaultUserListFilterOptions();
    }
  }

  private async loadPageUserList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.pageIndex,
      this.pageSize
    );
    const filterOptions =
      this.filterOptionsService.getFilterOptionsFromFilterOptionsWithMetadata(
        this.filterOptions
      );
    try {
      const { totalUserCount, userList, userRoleList, userTagList } =
        await this.userManagementService.getUserList(
          offset,
          this.pageSize,
          this.sortOrder,
          true,
          true,
          filterOptions
        );
      this.totalUserCount = totalUserCount;
      this.userList = userList;
      this.userRoleList = userRoleList || [];
      this.userTagList = userTagList || [];
    } catch (e) {
      this.handleError('Failed to retrieve user list', e);
    }
  }

  public onUserListFilterOptionsUpdated(
    filterOptions: UserListFilterOptionsWithMetadata
  ): void {
    this.navigateToPage(
      this.pageIndex,
      this.pageSize,
      this.sortOrder,
      filterOptions
    );
  }

  public getUserRoleListString(userRoleList: UserRole[]): string {
    if (userRoleList.length === 0) {
      return 'No role assigned';
    }
    return userRoleList.map((userRole) => userRole.displayName).join(', ');
  }

  public onSortOrderChanged(newSortOrder: UserListSortOrder): void {
    this.navigateToPage(
      this.pageIndex,
      this.pageSize,
      newSortOrder,
      this.filterOptions
    );
  }

  public onPageIndexChanged(newPageIndex: number): void {
    this.navigateToPage(
      newPageIndex,
      this.pageSize,
      this.sortOrder,
      this.filterOptions
    );
  }

  public onPageSizeChanged(newPageSize: number): void {
    this.navigateToPage(
      this.pageIndex,
      newPageSize,
      this.sortOrder,
      this.filterOptions
    );
  }

  private navigateToPage(
    pageIndex: number,
    pageSize: number,
    sortOrder: UserListSortOrder,
    filterOptions: UserListFilterOptionsWithMetadata
  ): void {
    const queryParams: any = {};
    if (pageIndex !== DEFAULT_USER_LIST_PAGE_INDEX) {
      queryParams['index'] = pageIndex;
    }
    if (pageSize !== DEFAULT_USER_LIST_PAGE_SIZE) {
      queryParams['size'] = pageSize;
    }
    if (sortOrder !== DEFAULT_SORT_ORDER) {
      queryParams['sort'] = sortOrder;
    }
    queryParams['filter'] = this.jsonCompressService.compress(filterOptions);
    this.router.navigate(['/manage-users'], {
      queryParams,
    });
  }

  public onCreateNewUserClicked(): void {
    this.createNewUserModalFormGroup.reset({
      displayName: '',
      username: '',
      password: '',
      passwordType: '',
    });
    this.isCreateNewUserModalVisible = true;
  }

  public onCreateNewUserModalCancel(): void {
    this.isCreateNewUserModalVisible = false;
  }

  public async onCreateNewUserModalOk(): Promise<void> {
    const { displayName, username, password } =
      this.createNewUserModalFormGroup.value;
    try {
      await this.userManagementService.createUser(
        username,
        displayName,
        password
      );
    } catch (e) {
      this.handleError('Failed to create new user', e);
      return;
    }

    this.notificationService.success('Successfully created new user', '');
    await this.loadPageUserList();
    this.isCreateNewUserModalVisible = false;
  }

  public onEditUserClicked(index: number): void {
    this.editUserModalUserListItemIndex = index;
    this.editUserModalUserID = this.userList[index].id;
    this.editUserModalFormGroup.reset({
      displayName: this.userList[index].displayName,
      username: this.userList[index].username,
      password: '',
      passwordConfirm: '',
    });
    this.isEditUserModalVisible = true;
  }

  public onEditUserModalCancel(): void {
    this.isEditUserModalVisible = false;
  }

  public async onEditUserModalSubmitClicked(): Promise<void> {
    const { displayName, username, password } =
      this.editUserModalFormGroup.value;
    let newPassword: string | undefined = undefined;
    if (password !== '') {
      newPassword = password;
    }

    try {
      await this.userManagementService.updateUser(
        this.editUserModalUserID,
        username,
        displayName,
        newPassword
      );
    } catch (e) {
      this.handleError('Failed to remove user role from user', e);
      return;
    }

    this.notificationService.success('Successfully updated user', '');
    await this.loadPageUserList();
    this.isEditUserModalVisible = false;
  }

  public async onEditUserModalUserRoleListDeleteClicked(
    userRole: UserRole
  ): Promise<void> {
    try {
      await this.userRoleManagementService.removeUserRoleFromUser(
        this.editUserModalUserID,
        userRole.id
      );
    } catch (e) {
      this.handleError('Failed to remove user role from user', e);
      return;
    }

    this.notificationService.success(
      'Successfully remove user role from user',
      ''
    );
    this.userRoleList[this.editUserModalUserListItemIndex] = this.userRoleList[
      this.editUserModalUserListItemIndex
    ].filter((userRoleItem) => userRoleItem.id != userRole.id);
  }

  public async onAddUserRoleClicked(): Promise<void> {
    this.addUserRoleModalPageIndex = 1;
    this.addUserRoleModalPageSize = 10;
    this.addUserRoleModalSortOrder = UserRoleListSortOrder.ID_ASCENDING;
    await this.loadUserRoleList();
    this.isAddUserRoleModalVisible = true;
  }

  public onAddUserRoleModalCancel(): void {
    this.isAddUserRoleModalVisible = false;
  }

  public async onAddUserRoleModalSortOrderChanged(
    newSortOrder: UserRoleListSortOrder
  ): Promise<void> {
    this.addUserRoleModalSortOrder = newSortOrder;
    await this.loadUserRoleList();
  }

  public async onAddUserRoleModalPageIndexChanged(
    newPageIndex: number
  ): Promise<void> {
    this.addUserRoleModalPageIndex = newPageIndex;
    await this.loadUserRoleList();
  }

  public async onAddUserRoleModalPageSizeChanged(
    newPageSize: number
  ): Promise<void> {
    this.addUserRoleModalPageSize = newPageSize;
    await this.loadUserRoleList();
  }

  private async loadUserRoleList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.addUserRoleModalPageIndex,
      this.addUserRoleModalPageSize
    );
    try {
      const { totalUserRoleCount, userRoleList } =
        await this.userRoleManagementService.getUserRoleList(
          offset,
          this.addUserRoleModalPageSize,
          this.addUserRoleModalSortOrder,
          false
        );
      this.addUserRoleModalTotalUserRoleCount = totalUserRoleCount;
      this.addUserRoleModalUserRoleList = userRoleList;
    } catch (e) {
      this.handleError('Failed to retrieve user role list', e);
    }
  }

  public async onAddUserRoleModalItemClicked(
    userRole: UserRole
  ): Promise<void> {
    try {
      await this.userRoleManagementService.addUserRoleToUser(
        this.editUserModalUserID,
        userRole.id
      );
    } catch (e) {
      this.handleError('Failed to add user role to user', e);
      return;
    }
    this.notificationService.success(
      'Successfully added user role to user',
      ''
    );
    this.userRoleList[this.editUserModalUserListItemIndex] = [
      ...this.userRoleList[this.editUserModalUserListItemIndex],
      userRole,
    ];
    this.isAddUserRoleModalVisible = false;
  }

  public async onEditUserModalUserTagListDeleteClicked(
    userTag: UserTag
  ): Promise<void> {
    try {
      await this.userTagManagementService.removeUserTagFromUser(
        this.editUserModalUserID,
        userTag.id
      );
    } catch (e) {
      this.handleError('Failed to remove user tag from user', e);
      return;
    }

    this.notificationService.success(
      'Successfully remove user tag from user',
      ''
    );
    this.userTagList[this.editUserModalUserListItemIndex] = this.userTagList[
      this.editUserModalUserListItemIndex
    ].filter((userTagItem) => userTagItem.id != userTag.id);
  }

  public async onAddUserTagClicked(): Promise<void> {
    this.addUserTagModalPageIndex = 1;
    this.addUserTagModalPageSize = 10;
    this.addUserTagModalSortOrder = UserTagListSortOrder.ID_ASCENDING;
    await this.loadUserTagList();
    this.isAddUserTagModalVisible = true;
  }

  public onAddUserTagModalCancel(): void {
    this.isAddUserTagModalVisible = false;
  }

  public async onAddUserTagModalSortOrderChanged(
    newSortOrder: UserTagListSortOrder
  ): Promise<void> {
    this.addUserTagModalSortOrder = newSortOrder;
    await this.loadUserTagList();
  }

  public async onAddUserTagModalPageIndexChanged(
    newPageIndex: number
  ): Promise<void> {
    this.addUserTagModalPageIndex = newPageIndex;
    await this.loadUserTagList();
  }

  public async onAddUserTagModalPageSizeChanged(
    newPageSize: number
  ): Promise<void> {
    this.addUserTagModalPageSize = newPageSize;
    await this.loadUserTagList();
  }

  private async loadUserTagList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.addUserTagModalPageIndex,
      this.addUserTagModalPageSize
    );
    try {
      const { totalUserTagCount, userTagList } =
        await this.userTagManagementService.getUserTagList(
          offset,
          this.addUserTagModalPageSize,
          this.addUserTagModalSortOrder
        );
      this.addUserTagModalTotalUserTagCount = totalUserTagCount;
      this.addUserTagModalUserTagList = userTagList;
    } catch (e) {
      this.handleError('Failed to retrieve user tag list', e);
    }
  }

  public async onAddUserTagModalItemClicked(userTag: UserTag): Promise<void> {
    try {
      await this.userTagManagementService.addUserTagToUser(
        this.editUserModalUserID,
        userTag.id
      );
    } catch (e) {
      this.handleError('Failed to add user tag to user', e);
      return;
    }
    this.notificationService.success('Successfully added user tag to user', '');
    this.userTagList[this.editUserModalUserListItemIndex] = [
      ...this.userTagList[this.editUserModalUserListItemIndex],
      userTag,
    ];
    this.isAddUserTagModalVisible = false;
  }

  public async onManageUserPermissionPanelActiveChange(
    isActive: boolean
  ): Promise<void> {
    if (!isActive) {
      return;
    }
    this.editUserUserCanManageUserImagePageIndex =
      DEFAULT_USER_CAN_MANAGE_USER_IMAGE_LIST_PAGE_INDEX;
    this.editUserUserCanManageUserImagePageSize =
      DEFAULT_USER_CAN_MANAGE_USER_IMAGE_LIST_PAGE_SIZE;
    await this.loadUserCanManageUserImageList();
  }

  public async onUserCanManageUserImagePageIndexChanged(
    newPageIndex: number
  ): Promise<void> {
    this.editUserUserCanManageUserImagePageIndex = newPageIndex;
    await this.loadUserCanManageUserImageList();
  }

  private async loadUserCanManageUserImageList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.editUserUserCanManageUserImagePageIndex,
      this.editUserUserCanManageUserImagePageSize
    );
    try {
      const { totalUserCount, userList } =
        await this.userManagementService.getUserCanManageUserImageListOfUser(
          this.editUserModalUserID,
          offset,
          this.editUserUserCanManageUserImagePageSize
        );
      this.editUserUserCanManageUserImageCount = totalUserCount;
      this.editUserUserCanManageUserImageList = userList;
    } catch (e) {
      this.handleError('Failed to get list of users with manageable images', e);
    }
  }

  public async onUserCanManageUserImageCanEditChanged(
    userCanManageUserImage: UserCanManageUserImage,
    canEdit: boolean
  ): Promise<void> {
    try {
      await this.userManagementService.updateUserCanManageUserImage(
        this.editUserModalUserID,
        userCanManageUserImage.user.id,
        canEdit
      );
    } catch (e) {
      this.handleError('Failed to update user can manage image relation', e);
      return;
    }
    this.notificationService.success(
      'Updated user can manage image relation successfully',
      ''
    );
    this.loadUserCanManageUserImageList();
  }

  public async onDeleteUserCanManageUserImageClicked(
    userCanManageUserImage: UserCanManageUserImage
  ): Promise<void> {
    try {
      await this.userManagementService.deleteUserCanManageUserImage(
        this.editUserModalUserID,
        userCanManageUserImage.user.id
      );
    } catch (e) {
      this.handleError('Failed to remove user from the list', e);
      return;
    }
    this.notificationService.success(
      'Removed user from the list successfully',
      ''
    );
    this.loadUserCanManageUserImageList();
  }

  public onAddUserCanManageUserImageClicked(): void {
    this.addUserCanMangeUserImageUser = undefined;
    this.addUserCanMangeUserImageCanEdit = false;
    this.isAddUserCanMangeUserImageModalVisible = true;
  }

  public onUserCanManageUserImageAddUserModalUserSelected(
    user: User | undefined
  ): void {
    this.addUserCanMangeUserImageUser = user;
  }

  public async onUserCanManageUserImageAddUserModalOk(): Promise<void> {
    if (this.addUserCanMangeUserImageUser === undefined) {
      return;
    }
    const imageOfUserID = this.addUserCanMangeUserImageUser.id;
    this.isAddUserCanMangeUserImageModalVisible = false;
    try {
      await this.userManagementService.createUserCanManageUserImage(
        this.editUserModalUserID,
        imageOfUserID,
        this.addUserCanMangeUserImageCanEdit
      );
    } catch (e) {
      this.handleError('Failed to add user to the list', e);
      return;
    }
    this.notificationService.success('Added user to the list successfully', '');
    await this.loadUserCanManageUserImageList();
  }

  public onUserCanManageUserImageAddUserModalCancel(): void {
    this.isAddUserCanMangeUserImageModalVisible = false;
  }

  public async onVerifyUserPermissionPanelActiveChange(
    isActive: boolean
  ): Promise<void> {
    if (!isActive) {
      return;
    }
    this.editUserUserCanVerifyUserImagePageIndex =
      DEFAULT_USER_CAN_VERIFY_USER_IMAGE_LIST_PAGE_INDEX;
    this.editUserUserCanVerifyUserImagePageSize =
      DEFAULT_USER_CAN_VERIFY_USER_IMAGE_LIST_PAGE_SIZE;
    await this.loadUserCanVerifyUserImageList();
  }

  public async onUserCanVerifyUserImagePageIndexChanged(
    newPageIndex: number
  ): Promise<void> {
    this.editUserUserCanVerifyUserImagePageIndex = newPageIndex;
    await this.loadUserCanVerifyUserImageList();
  }

  private async loadUserCanVerifyUserImageList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.editUserUserCanVerifyUserImagePageIndex,
      this.editUserUserCanVerifyUserImagePageSize
    );
    try {
      const { totalUserCount, userList } =
        await this.userManagementService.getUserCanVerifyUserImageListOfUser(
          this.editUserModalUserID,
          offset,
          this.editUserUserCanVerifyUserImagePageSize
        );
      this.editUserUserCanVerifyUserImageCount = totalUserCount;
      this.editUserUserCanVerifyUserImageList = userList;
    } catch (e) {
      this.handleError('Failed to get list of users with verifiable images', e);
    }
  }

  public async onDeleteUserCanVerifyUserImageClicked(
    userCanVerifyUserImage: UserCanVerifyUserImage
  ): Promise<void> {
    try {
      await this.userManagementService.deleteUserCanVerifyUserImage(
        this.editUserModalUserID,
        userCanVerifyUserImage.user.id
      );
    } catch (e) {
      this.handleError('Failed to remove user from the list', e);
      return;
    }
    this.notificationService.success(
      'Removed user from the list successfully',
      ''
    );
    this.loadUserCanVerifyUserImageList();
  }

  public onAddUserCanVerifyUserImageClicked(): void {
    this.addUserCanVerifyUserImageUser = undefined;
    this.isAddUserCanVerifyUserImageModalVisible = true;
  }

  public onUserCanVerifyUserImageAddUserModalUserSelected(
    user: User | undefined
  ): void {
    this.addUserCanVerifyUserImageUser = user;
  }

  public async onUserCanVerifyUserImageAddUserModalOk(): Promise<void> {
    if (this.addUserCanVerifyUserImageUser === undefined) {
      return;
    }
    const imageOfUserID = this.addUserCanVerifyUserImageUser.id;
    this.isAddUserCanVerifyUserImageModalVisible = false;
    try {
      await this.userManagementService.createUserCanVerifyUserImage(
        this.editUserModalUserID,
        imageOfUserID
      );
    } catch (e) {
      this.handleError('Failed to add user to the list', e);
      return;
    }
    this.notificationService.success('Added user to the list successfully', '');
    await this.loadUserCanVerifyUserImageList();
  }

  public onUserCanVerifyUserImageAddUserModalCancel(): void {
    this.isAddUserCanVerifyUserImageModalVisible = false;
  }

  private handleError(notificationTitle: string, e: any) {
    if (e instanceof InvalidUserListArgumentError) {
      this.notificationService.error(
        notificationTitle,
        'Invalid user list arguments'
      );
      this.router.navigateByUrl('/welcome');
      return;
    }
    if (e instanceof InvalidUserRoleListArgument) {
      this.notificationService.error(
        notificationTitle,
        'Invalid user role list arguments'
      );
      this.router.navigateByUrl('/welcome');
      return;
    }
    if (e instanceof UnauthenticatedError) {
      this.notificationService.error(
        notificationTitle,
        'User is not logged in'
      );
      this.router.navigateByUrl('/login');
      return;
    }
    if (e instanceof UnauthorizedError) {
      this.notificationService.error(
        notificationTitle,
        'User does not have the required permission'
      );
      this.router.navigateByUrl('/welcome');
      return;
    }
    if (e instanceof InvalidUserInformationError) {
      this.notificationService.error(
        notificationTitle,
        'Invalid user information'
      );
      return;
    }
    if (e instanceof UserOrUserRoleNotFoundError) {
      this.notificationService.error(
        notificationTitle,
        'Cannot find user or user role'
      );
      return;
    }
    if (e instanceof UserAlreadyHasUserRoleError) {
      this.notificationService.error(
        notificationTitle,
        'User already has user role'
      );
      return;
    }
    if (e instanceof UserDoesNotHaveUserRoleError) {
      this.notificationService.error(
        notificationTitle,
        'User does not have user role'
      );
      return;
    }
    if (e instanceof UserNotFoundError) {
      this.notificationService.error(notificationTitle, 'Cannot find user');
      return;
    }
    if (e instanceof SameUserError) {
      this.notificationService.error(
        notificationTitle,
        'Trying to add a user to their own list'
      );
      return;
    }
    if (e instanceof UserAlreadyInListError) {
      this.notificationService.error(
        notificationTitle,
        'User is already in the list'
      );
      return;
    }
    if (e instanceof UserNotInListError) {
      this.notificationService.error(
        notificationTitle,
        'User is not in the list'
      );
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
