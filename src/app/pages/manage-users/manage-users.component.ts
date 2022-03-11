import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  User,
  UserListSortOrder,
  UserRole,
} from 'src/app/services/dataaccess/api';
import { UserManagementService } from 'src/app/services/module/user-management';

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
  public createNewUserDisplayName: string = '';
  public createNewUserUsername: string = '';
  public createNewUserPassword: string = '';
  public createNewUserPasswordRetype: string = '';

  public isEditUserModalVisible: boolean = false;
  public editUserModalUserID: number = 0;
  public editUserModalDisplayName: string = '';
  public editUserModalUsername: string = '';
  public editUserModalPassword: string = '';
  public editUserModalPasswordRetype: string = '';
  public editUserModalUserRoleList: UserRole[] | null = null;

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.getPaginationInfoFromQueryParams(params);
      this.loadPageData().then(
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

  private async loadPageData(): Promise<void> {
    const offset = this.getCurrentPageOffset();
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

  private getCurrentPageOffset(): number {
    return (this.pageIndex - 1) * this.pageSize;
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
    this.createNewUserDisplayName = '';
    this.createNewUserUsername = '';
    this.createNewUserPassword = '';
    this.createNewUserPasswordRetype = '';
    this.isCreateNewUserModalVisible = true;
  }

  public onCreateNewUserModalCancel(): void {
    this.isCreateNewUserModalVisible = false;
  }

  public async onCreateNewUserModalOk(): Promise<void> {
    if (this.createNewUserPassword !== this.createNewUserPasswordRetype) {
      return;
    }
    await this.userManagementService.createUser(
      this.createNewUserUsername,
      this.createNewUserDisplayName,
      this.createNewUserPassword
    );
    await this.loadPageData();
    this.isCreateNewUserModalVisible = false;
  }

  public onEditUserClicked(index: number): void {
    this.editUserModalUserID = this.userList[index].id;
    this.editUserModalDisplayName = this.userList[index].displayName;
    this.editUserModalUsername = this.userList[index].username;
    this.editUserModalPassword = '';
    this.editUserModalPasswordRetype = '';
    this.editUserModalUserRoleList = this.userRoleList[index];
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
    await this.loadPageData();
    this.isEditUserModalVisible = false;
  }
}
