import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  User,
  UserListSortOrder,
  UserRole,
  UserRoleListSortOrder,
} from 'src/app/services/dataaccess/api';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { UserRoleManagementService } from 'src/app/services/module/user-role-management';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

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

  public pageIndex: number = 1;
  public pageSize: number = 10;
  public sortOrder: UserListSortOrder = UserListSortOrder.ID_ASCENDING;
  public totalUserCount: number = 0;
  public userList: User[] = [];
  public userRoleList: UserRole[][] = [];

  public isCreateNewUserModalVisible: boolean = false;
  public createNewUserModalFormGroup: FormGroup;

  public isEditUserModalVisible: boolean = false;
  public editUserModalUserListItemIndex: number = 0;
  public editUserModalUserID: number = 0;
  public editUserModalDisplayName: string = '';
  public editUserModalUsername: string = '';
  public editUserModalPassword: string = '';
  public editUserModalPasswordRetype: string = '';

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
    formBuilder: FormBuilder
  ) {
    this.createNewUserModalFormGroup = formBuilder.group({
      displayName: ['', [this.displayNameValidator()]],
      username: ['', [this.usernameValidator()]],
      password: ['', [this.passwordValidator()]],
      passwordRetype: ['', [this.passwordRetypeValidator()]],
    });
    this.createNewUserModalFormGroup.reset({
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

  private passwordRetypeValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const passwordRetype: string = control.value;
      if (passwordRetype === '') {
        return { error: true, required: true };
      }
      const password: string = this.createNewUserModalFormGroup?.value.password;
      if (passwordRetype !== password) {
        return { error: true, equal: true };
      }
      return null;
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
    }
    if (params['size'] !== undefined) {
      this.pageSize = +params['size'];
    }
    if (params['sort'] !== undefined) {
      this.sortOrder = +params['sort'];
    }
  }

  private async loadPageUserList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.pageIndex,
      this.pageSize
    );
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
    await this.userManagementService.createUser(
      username,
      displayName,
      password
    );
    await this.loadPageUserList();
    this.isCreateNewUserModalVisible = false;
  }

  public onEditUserClicked(index: number): void {
    this.editUserModalUserListItemIndex = index;
    this.editUserModalUserID = this.userList[index].id;
    this.editUserModalDisplayName = this.userList[index].displayName;
    this.editUserModalUsername = this.userList[index].username;
    this.editUserModalPassword = '';
    this.editUserModalPasswordRetype = '';
    this.isEditUserModalVisible = true;
  }

  public onEditUserModalCancel(): void {
    this.isEditUserModalVisible = false;
  }

  public async onEditUserModalSubmitClicked(): Promise<void> {
    let newPassword: string | undefined = undefined;
    if (this.editUserModalPassword !== '') {
      if (this.editUserModalPassword !== this.editUserModalPasswordRetype) {
        return;
      }
      newPassword = this.editUserModalPassword;
    }
    await this.userManagementService.updateUser(
      this.editUserModalUserID,
      this.editUserModalUsername,
      this.editUserModalDisplayName,
      newPassword
    );
    await this.loadPageUserList();
    this.isEditUserModalVisible = false;
  }

  public async onEditUserModalUserRoleListDeleteClicked(
    userRole: UserRole
  ): Promise<void> {
    await this.userRoleManagementService.removeUserRoleFromUser(
      this.editUserModalUserID,
      userRole.id
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
    const { totalUserRoleCount, userRoleList } =
      await this.userRoleManagementService.getUserRoleList(
        offset,
        this.addUserRoleModalPageSize,
        this.addUserRoleModalSortOrder,
        false
      );
    this.addUserRoleModalTotalUserRoleCount = totalUserRoleCount;
    this.addUserRoleModalUserRoleList = userRoleList;
  }

  public async onAddUserRoleModalItemClicked(
    userRole: UserRole
  ): Promise<void> {
    console.log(userRole);
    await this.userRoleManagementService.addUserRoleToUser(
      this.editUserModalUserID,
      userRole.id
    );
    this.userRoleList[this.editUserModalUserListItemIndex] = [
      ...this.userRoleList[this.editUserModalUserListItemIndex],
      userRole,
    ];
    this.isAddUserRoleModalVisible = false;
  }
}
