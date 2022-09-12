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
  UserTag,
  UserTagListSortOrder,
  InvalidUserTagListArgument,
  InvalidUserTagInformationError,
  UserTagNotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { UserTagManagementService } from 'src/app/services/module/user-tag-management';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ORDER = UserTagListSortOrder.ID_ASCENDING;

@Component({
  selector: 'app-manage-tags',
  templateUrl: './manage-tags.component.html',
  styleUrls: ['./manage-tags.component.scss'],
})
export class ManageTagsComponent implements OnInit {
  public sortOrderOptions: { value: UserTagListSortOrder; title: string }[] = [
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
  public pageSizeOptions: number[] = [10, 20, 50, 100];

  public pageIndex: number = DEFAULT_PAGE_INDEX;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public sortOrder: UserTagListSortOrder = DEFAULT_SORT_ORDER;
  public totalUserTagCount: number = 0;
  public userTagList: UserTag[] = [];

  public isCreateNewUserTagModalVisible: boolean = false;
  public createNewUserTagModalFormGroup: FormGroup;

  public isEditUserTagModalVisible: boolean = false;
  public editUserTagModalUserListItemIndex: number = 0;
  public editUserTagModalUserTagID: number = 0;
  public editUserTagModalFormGroup: FormGroup;

  constructor(
    private readonly userTagManagementService: UserTagManagementService,
    private readonly paginationService: PaginationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly modalService: NzModalService,
    formBuilder: FormBuilder
  ) {
    this.createNewUserTagModalFormGroup = formBuilder.group({
      displayName: ['', [Validators.required, this.displayNameValidator()]],
      description: ['', [Validators.required, this.descriptionValidator()]],
    });
    this.createNewUserTagModalFormGroup.reset({
      displayName: '',
      description: '',
    });
    this.editUserTagModalFormGroup = formBuilder.group({
      displayName: ['', [Validators.required, this.displayNameValidator()]],
      description: ['', [Validators.required, this.descriptionValidator()]],
    });
    this.editUserTagModalFormGroup.reset({
      displayName: '',
      description: '',
    });
  }

  private displayNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const displayName: string = control.value;
      return this.userTagManagementService.isValidDisplayName(displayName);
    };
  }

  private descriptionValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const username: string = control.value;
      return this.userTagManagementService.isValidDescription(username);
    };
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.getPaginationInfoFromQueryParams(params);
      this.loadPageUserTagList().then();
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

  private async loadPageUserTagList(): Promise<void> {
    const offset = this.paginationService.getPageOffset(
      this.pageIndex,
      this.pageSize
    );
    try {
      const { totalUserTagCount, userTagList } =
        await this.userTagManagementService.getUserTagList(
          offset,
          this.pageSize,
          this.sortOrder
        );
      this.totalUserTagCount = totalUserTagCount;
      this.userTagList = userTagList;
    } catch (e) {
      if (e instanceof InvalidUserTagListArgument) {
        this.notificationService.error(
          'Failed to retrieve user tag list',
          'Invalid page arguments'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to retrieve user tag list',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to retrieve user tag list',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to retrieve user tag list',
          'Unknown error'
        );
      }
    }
  }

  public onSortOrderChanged(newSortOrder: UserTagListSortOrder): void {
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
    sortOrder: UserTagListSortOrder
  ): void {
    this.router.navigate(['/manage-tags'], {
      queryParams: {
        page: pageIndex,
        size: pageSize,
        sort: sortOrder,
      },
    });
  }

  public onCreateNewUserTagClicked(): void {
    this.createNewUserTagModalFormGroup.reset({
      displayName: '',
      description: '',
    });
    this.isCreateNewUserTagModalVisible = true;
  }

  public onCreateNewUserTagModalCancel(): void {
    this.isCreateNewUserTagModalVisible = false;
  }

  public async onCreateNewUserTagModalOk(): Promise<void> {
    const { displayName, description } =
      this.createNewUserTagModalFormGroup.value;
    try {
      await this.userTagManagementService.createUserTag(
        displayName,
        description
      );
    } catch (e) {
      if (e instanceof InvalidUserTagInformationError) {
        this.notificationService.error(
          'Failed to create new user tag',
          'Invalid user tag information'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to create new user tag',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to create new user tag',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to create new user tag',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Successfully created new user tag', '');
    await this.loadPageUserTagList();
    this.isCreateNewUserTagModalVisible = false;
  }

  public onEditUserTagClicked(index: number): void {
    this.editUserTagModalUserListItemIndex = index;
    this.editUserTagModalUserTagID = this.userTagList[index].id;
    this.editUserTagModalFormGroup.reset({
      displayName: this.userTagList[index].displayName,
      description: this.userTagList[index].description,
    });
    this.isEditUserTagModalVisible = true;
  }

  public onEditUserTagModalCancel(): void {
    this.isEditUserTagModalVisible = false;
  }

  public async onEditUserTagModalSubmitClicked(): Promise<void> {
    const { displayName, description } = this.editUserTagModalFormGroup.value;
    try {
      await this.userTagManagementService.updateUserTag(
        this.editUserTagModalUserTagID,
        displayName,
        description
      );
    } catch (e) {
      if (e instanceof InvalidUserTagInformationError) {
        this.notificationService.error(
          'Failed to update user tag',
          'Invalid user tag information'
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update user tag',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update user tag',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (e instanceof UserTagNotFoundError) {
        this.notificationService.error(
          'Failed to update user tag',
          'Cannot find user tag'
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to update user tag',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success('Successfully updated user tag', '');
    await this.loadPageUserTagList();
    this.isEditUserTagModalVisible = false;
  }

  public onDeleteUserTagClicked(index: number): void {
    this.modalService.warning({
      nzTitle: 'Delete user tag',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await this.userTagManagementService.deleteUserTag(
            this.userTagList[index].id
          );
        } catch (e) {
          if (e instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to delete user tag',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (e instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to delete user tag',
              "User doesn't have the required permission"
            );
            this.router.navigateByUrl('/welcome');
          } else if (e instanceof UserTagNotFoundError) {
            this.notificationService.error(
              'Failed to delete user tag',
              'Cannot find user tag'
            );
            this.router.navigateByUrl('/welcome');
          } else {
            this.notificationService.error(
              'Failed to delete user tag',
              'Unknown error'
            );
          }
          return;
        }

        this.notificationService.success('Successfully deleted user tag', '');
        await this.loadPageUserTagList();
      },
    });
  }
}
