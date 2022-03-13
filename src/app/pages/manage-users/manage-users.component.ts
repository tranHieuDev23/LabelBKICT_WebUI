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
import {
  InvalidUserInformationError,
  InvalidUserListArgument,
  InvalidUserRoleListArgument,
  UnauthenticatedError,
  UnauthorizedError,
  User,
  UserAlreadyHasUserRoleError,
  UserListSortOrder,
  UserNotFoundError,
  UserOrUserRoleNotFoundError,
  UserRole,
  UserRoleListSortOrder,
} from 'src/app/services/dataaccess/api';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { UserRoleManagementService } from 'src/app/services/module/user-role-management';
import { ConfirmedValidator } from 'src/app/services/utils/confirmed-validator/confirmed-validator';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ORDER = UserListSortOrder.ID_ASCENDING;

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

  public pageIndex: number = DEFAULT_PAGE_INDEX;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public sortOrder: UserListSortOrder = DEFAULT_SORT_ORDER;
  public totalUserCount: number = 0;
  public userList: User[] = [];
  public userRoleList: UserRole[][] = [];

  public isCreateNewUserModalVisible: boolean = false;
  public createNewUserModalFormGroup: FormGroup;

  public isEditUserModalVisible: boolean = false;
  public editUserModalUserListItemIndex: number = 0;
  public editUserModalUserID: number = 0;
  public editUserModalFormGroup: FormGroup;

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

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly userRoleManagementService: UserRoleManagementService,
    private readonly paginationService: PaginationService,
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
    this.activatedRoute.queryParams.subscribe((params) => {
      this.getPaginationInfoFromQueryParams(params);
      this.loadPageUserList().then(
        () => {},
        (error) => {
          console.error(error);
        }
      );
    });
  }

  private getPaginationInfoFromQueryParams(params: Params): void {
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
    if (params['sort'] !== undefined) {
      this.sortOrder = +params['sort'];
    } else {
      this.sortOrder = DEFAULT_SORT_ORDER;
    }
  }

  private async loadPageUserList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.pageIndex,
      this.pageSize
    );
    try {
      const { totalUserCount, userList, userRoleList } =
        await this.userManagementService.getUserList(
          offset,
          this.pageSize,
          this.sortOrder,
          true
        );
      this.totalUserCount = totalUserCount;
      this.userList = userList;
      this.userRoleList = userRoleList || [];
    } catch (e) {
      if (e instanceof InvalidUserListArgument) {
        this.notificationService.error(
          'Failed to retrieve user list',
          'Invalid page arguments'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to retrieve user list',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to retrieve user list',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to retrieve user list',
          'Unknown error'
        );
      }
    }
  }

  public getUserRoleListString(userRoleList: UserRole[]): string {
    if (userRoleList.length === 0) {
      return 'No role assigned';
    }
    return userRoleList.map((userRole) => userRole.displayName).join(', ');
  }

  public onSortOrderChanged(newSortOrder: UserListSortOrder): void {
    this.navigateToPage(this.pageIndex, this.pageSize, newSortOrder);
  }

  public onPageIndexChanged(newPageIndex: number): void {
    this.navigateToPage(newPageIndex, this.pageSize, this.sortOrder);
  }

  public onPageSizeChanged(newPageSize: number): void {
    this.navigateToPage(this.pageIndex, newPageSize, this.sortOrder);
  }

  private navigateToPage(
    pageIndex: number,
    pageSize: number,
    sortOrder: UserListSortOrder
  ): void {
    this.router.navigate(['/manage-users'], {
      queryParams: {
        page: pageIndex,
        size: pageSize,
        sort: sortOrder,
      },
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
      if (e instanceof InvalidUserInformationError) {
        this.notificationService.error(
          'Failed to create new user',
          'Invalid user role information'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to create new user',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to create new user',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to create new user',
          'Unknown error'
        );
      }
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
    const { displayName, username, formPassword } =
      this.editUserModalFormGroup.value;
    let newPassword: string | undefined = undefined;
    if (formPassword !== '') {
      newPassword = formPassword;
    }

    try {
      await this.userManagementService.updateUser(
        this.editUserModalUserID,
        username,
        displayName,
        newPassword
      );
    } catch (e) {
      if (e instanceof InvalidUserInformationError) {
        this.notificationService.error(
          'Failed to update user',
          'Invalid user information'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update user',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update user',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UserNotFoundError) {
        this.notificationService.error(
          'Failed to update user',
          'Cannot find user'
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to update user',
          'Unknown error'
        );
      }
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
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to remove user role from user',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to remove user role from user',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UserOrUserRoleNotFoundError) {
        this.notificationService.error(
          'Failed to remove user role from user',
          'Cannot find user or user role'
        );
      } else {
        this.notificationService.error(
          'Failed to remove user role from user',
          'Unknown error'
        );
      }
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
      if (e instanceof InvalidUserRoleListArgument) {
        this.notificationService.error(
          'Failed to retrieve user role list',
          'Invalid page arguments'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to retrieve user role list',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to retrieve user role list',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to retrieve user role list',
          'Unknown error'
        );
      }
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
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to add user role to user',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to add user role to user',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UserOrUserRoleNotFoundError) {
        this.notificationService.error(
          'Failed to add user role to user',
          'Cannot find user or user role'
        );
      } else if (e instanceof UserAlreadyHasUserRoleError) {
        this.notificationService.error(
          'Failed to add user role to user',
          'User already has user role'
        );
      } else {
        this.notificationService.error(
          'Failed to add user role to user',
          'Unknown error'
        );
      }
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
}
