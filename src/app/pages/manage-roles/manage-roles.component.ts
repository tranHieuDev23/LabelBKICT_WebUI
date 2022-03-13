import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  UserRole,
  UserRoleListSortOrder,
  UserPermission,
  InvalidUserRoleListArgument,
  InvalidUserRoleInformationError,
  UserRoleNotFoundError,
} from 'src/app/services/dataaccess/api';
import {
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api/errors';
import { UserPermissionManagementService } from 'src/app/services/module/user-permission-management';
import { UserRoleManagementService } from 'src/app/services/module/user-role-management';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';
import {
  PermissionTreeNode,
  PermissionTreeService,
} from 'src/app/services/utils/permission-tree/permission-tree.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ORDER = UserRoleListSortOrder.ID_ASCENDING;

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss'],
})
export class ManageRolesComponent implements OnInit {
  public sortOrderOptions: { value: UserRoleListSortOrder; title: string }[] = [
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
  public pageSizeOptions: number[] = [10, 20, 50, 100];

  public pageIndex: number = DEFAULT_PAGE_INDEX;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public sortOrder: UserRoleListSortOrder = DEFAULT_SORT_ORDER;
  public totalUserRoleCount: number = 0;
  public userRoleList: UserRole[] = [];
  public userPermissionList: UserPermission[][] = [];

  public isCreateNewUserRoleModalVisible: boolean = false;
  public createNewUserRoleModalFormGroup: FormGroup;

  public isEditUserRoleModalVisible: boolean = false;
  public editUserRoleModalUserListItemIndex: number = 0;
  public editUserRoleModalUserRoleID: number = 0;
  public editUserRoleModalFormGroup: FormGroup;

  public isAddUserPermissionModalVisible: boolean = false;
  public addUserPermissionModalUserPermissionList: UserPermission[] = [];
  public addUserPermissionModalPermissionTreeRootList: PermissionTreeNode[] =
    [];

  constructor(
    private readonly userRoleManagementService: UserRoleManagementService,
    private readonly userPermissionManagementService: UserPermissionManagementService,
    private readonly paginationService: PaginationService,
    private readonly permissionTreeService: PermissionTreeService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly modalService: NzModalService,
    formBuilder: FormBuilder
  ) {
    this.createNewUserRoleModalFormGroup = formBuilder.group({
      displayName: ['', [Validators.required, this.displayNameValidator()]],
      description: ['', [Validators.required, this.descriptionValidator()]],
    });
    this.createNewUserRoleModalFormGroup.reset({
      displayName: '',
      description: '',
    });
    this.editUserRoleModalFormGroup = formBuilder.group({
      displayName: ['', [Validators.required, this.displayNameValidator()]],
      description: ['', [Validators.required, this.descriptionValidator()]],
    });
    this.editUserRoleModalFormGroup.reset({
      displayName: '',
      description: '',
    });
  }

  private displayNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const displayName: string = control.value;
      return this.userRoleManagementService.isValidDisplayName(displayName);
    };
  }

  private descriptionValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const username: string = control.value;
      return this.userRoleManagementService.isValidDescription(username);
    };
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.getPaginationInfoFromQueryParams(params);
      this.loadPageUserRoleList().then();
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

  private async loadPageUserRoleList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.pageIndex,
      this.pageSize
    );
    try {
      const { totalUserRoleCount, userRoleList, userPermissionList } =
        await this.userRoleManagementService.getUserRoleList(
          offset,
          this.pageSize,
          this.sortOrder,
          true
        );
      this.totalUserRoleCount = totalUserRoleCount;
      this.userRoleList = userRoleList;
      this.userPermissionList = userPermissionList || [];
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

  public onSortOrderChanged(newSortOrder: UserRoleListSortOrder): void {
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
    sortOrder: UserRoleListSortOrder
  ): void {
    this.router.navigate(['/manage-roles'], {
      queryParams: {
        page: pageIndex,
        size: pageSize,
        sort: sortOrder,
      },
    });
  }

  public onCreateNewUserRoleClicked(): void {
    this.createNewUserRoleModalFormGroup.reset({
      displayName: '',
      description: '',
    });
    this.isCreateNewUserRoleModalVisible = true;
  }

  public onCreateNewUserRoleModalCancel(): void {
    this.isCreateNewUserRoleModalVisible = false;
  }

  public async onCreateNewUserRoleModalOk(): Promise<void> {
    const { displayName, description } =
      this.createNewUserRoleModalFormGroup.value;
    try {
      await this.userRoleManagementService.createUserRole(
        displayName,
        description
      );
    } catch (e) {
      if (e instanceof InvalidUserRoleInformationError) {
        this.notificationService.error(
          'Failed to create new user role',
          'Invalid user role information'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to create new user role',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to create new user role',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to create new user role',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Successfully created new user role', '');
    await this.loadPageUserRoleList();
    this.isCreateNewUserRoleModalVisible = false;
  }

  public onEditUserRoleClicked(index: number): void {
    this.editUserRoleModalUserListItemIndex = index;
    this.editUserRoleModalUserRoleID = this.userRoleList[index].id;
    this.editUserRoleModalFormGroup.reset({
      displayName: this.userRoleList[index].displayName,
      description: this.userRoleList[index].description,
    });
    this.isEditUserRoleModalVisible = true;
  }

  public onEditUserRoleModalCancel(): void {
    this.isEditUserRoleModalVisible = false;
  }

  public async onEditUserRoleModalSubmitClicked(): Promise<void> {
    const { displayName, description } = this.editUserRoleModalFormGroup.value;
    try {
      await this.userRoleManagementService.updateUserRole(
        this.editUserRoleModalUserRoleID,
        displayName,
        description
      );
    } catch (e) {
      if (e instanceof InvalidUserRoleInformationError) {
        this.notificationService.error(
          'Failed to update user role',
          'Invalid user role information'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update user role',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update user role',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UserRoleNotFoundError) {
        this.notificationService.error(
          'Failed to update user role',
          'Cannot find user role'
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to update user role',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Successfully updated user role', '');
    await this.loadPageUserRoleList();
    this.isEditUserRoleModalVisible = false;
  }

  public onDeleteUserRoleClicked(index: number): void {
    this.modalService.warning({
      nzTitle: 'Delete user role',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOnOk: async () => {
        try {
          await this.userRoleManagementService.deleteUserRole(
            this.userRoleList[index].id
          );
        } catch (e) {
          if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to delete user role',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to delete user role',
              "User doesn't have the required permission"
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof UserRoleNotFoundError) {
            this.notificationService.error(
              'Failed to delete user role',
              'Cannot find user role'
            );
            this.router.navigateByUrl('/welcome');
          } else {
            this.notificationService.error(
              'Failed to delete user role',
              'Unknown error'
            );
          }
          return;
        }

        this.notificationService.success('Successfully deleted user role', '');
        await this.loadPageUserRoleList();
      },
    });
  }
}
