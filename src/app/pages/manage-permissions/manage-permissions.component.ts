import { Component, OnInit } from '@angular/core';
import { UserPermissionManagementService } from 'src/app/services/module/user-permission-management';
import {
  InvalidUserPermissionInformationError,
  UnauthenticatedError,
  UnauthorizedError,
  UserPermission,
  UserPermissionNotFoundError,
} from 'src/app/services/dataaccess/api';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  PermissionTreeNode,
  PermissionTreeService,
} from 'src/app/services/utils/permission-tree/permission-tree.service';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-manage-permissions',
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss'],
})
export class ManagePermissionsComponent implements OnInit {
  public userPermissionList: UserPermission[] = [];
  public permissionTreeRootList: PermissionTreeNode[] = [];

  public isCreateNewUserPermissionModalVisible: boolean = false;
  public createNewUserPermissionModalFormGroup: FormGroup;

  public isUpdateUserPermissionModalVisible: boolean = false;
  public updateUserPermissionUserPermissionID: number = 0;
  public updateUserPermissionModalFormGroup: FormGroup;

  constructor(
    private readonly userPermissionManagementService: UserPermissionManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly permissionTreeService: PermissionTreeService,
    private readonly router: Router,
    private readonly modalService: NzModalService,
    formBuilder: FormBuilder
  ) {
    this.createNewUserPermissionModalFormGroup = formBuilder.group({
      permissionName: [
        '',
        [Validators.required, this.permissionNameValidator()],
      ],
      description: ['', [Validators.required, this.descriptionValidator()]],
    });
    this.createNewUserPermissionModalFormGroup.reset({
      permissionName: '',
      description: '',
    });
    this.updateUserPermissionModalFormGroup = formBuilder.group({
      permissionName: [
        '',
        [Validators.required, this.permissionNameValidator()],
      ],
      description: ['', [Validators.required, this.descriptionValidator()]],
    });
    this.updateUserPermissionModalFormGroup.reset({
      permissionName: '',
      description: '',
    });
  }

  private permissionNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const permissionName: string = control.value;
      return this.userPermissionManagementService.isValidPermissionName(
        permissionName
      );
    };
  }

  private descriptionValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const description: string = control.value;
      return this.userPermissionManagementService.isValidDescription(
        description
      );
    };
  }

  ngOnInit(): void {
    (async () => {
      try {
        this.userPermissionList =
          await this.userPermissionManagementService.getUserPermissionList();
      } catch (error) {
        if (error instanceof UnauthenticatedError) {
          this.notificationService.error(
            'Failed to retrieve user permission list',
            'User is not logged in'
          );
          this.router.navigateByUrl('/login');
        } else if (error instanceof UnauthorizedError) {
          this.notificationService.error(
            'Failed to retrieve user permission list',
            "User doesn't have the required permission"
          );
          this.router.navigateByUrl('/welcome');
        } else {
          this.notificationService.error(
            'Failed to retrieve user permission list',
            'Unknown error'
          );
          this.router.navigateByUrl('/welcome');
        }
        return;
      }
      this.permissionTreeRootList =
        this.permissionTreeService.getPermissionTree(this.userPermissionList);
    })().then();
  }

  public async onCreateNewUserPermissionClicked(): Promise<void> {
    this.createNewUserPermissionModalFormGroup.reset({
      permissionName: '',
      description: '',
    });
    this.isCreateNewUserPermissionModalVisible = true;
  }

  public async onNewUserPermissionModalCancel(): Promise<void> {
    this.isCreateNewUserPermissionModalVisible = false;
  }

  public async onNewUserPermissionModalOk(): Promise<void> {
    const { permissionName, description } =
      this.createNewUserPermissionModalFormGroup.value;

    let userPermission: UserPermission;
    try {
      userPermission =
        await this.userPermissionManagementService.createUserPermission(
          permissionName,
          description
        );
    } catch (error) {
      if (error instanceof InvalidUserPermissionInformationError) {
        this.notificationService.error(
          'Failed to create new user permission',
          'Invalid user permission information'
        );
      } else if (error instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to create new user permission',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (error instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to create new user permission',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else {
        this.notificationService.error(
          'Failed to create new user permission',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success(
      'Successfully created user permission',
      ''
    );
    this.userPermissionList = [...this.userPermissionList, userPermission].sort(
      (a, b) => a.permissionName.localeCompare(b.permissionName)
    );
    this.permissionTreeRootList = this.permissionTreeService.getPermissionTree(
      this.userPermissionList
    );
    this.isCreateNewUserPermissionModalVisible = false;
  }

  public async onDeleteUserPermissionClicked(
    userPermission: UserPermission
  ): Promise<void> {
    this.modalService.warning({
      nzTitle: 'Delete user permission',
      nzContent: 'Are you sure? This action <b>CANNOT</b> be undone.',
      nzCancelText: 'Cancel',
      nzOnOk: async () => {
        try {
          await this.userPermissionManagementService.deleteUserPermission(
            userPermission.id
          );
        } catch (error) {
          if (error instanceof UnauthenticatedError) {
            this.notificationService.error(
              'Failed to delete new user permission',
              'User is not logged in'
            );
            this.router.navigateByUrl('/login');
          } else if (error instanceof UnauthorizedError) {
            this.notificationService.error(
              'Failed to delete new user permission',
              "User doesn't have the required permission"
            );
            this.router.navigateByUrl('/welcome');
          } else if (error instanceof UserPermissionNotFoundError) {
            this.notificationService.error(
              'Failed to delete new user permission',
              'Cannot find user permission'
            );
          } else {
            this.notificationService.error(
              'Failed to delete new user permission',
              'Unknown error'
            );
          }
          return;
        }

        this.notificationService.success(
          'Successfully deleted user permission',
          ''
        );
        this.userPermissionList = this.userPermissionList.filter(
          (userPermissionItem) => userPermissionItem.id !== userPermission.id
        );
        this.permissionTreeRootList =
          this.permissionTreeService.getPermissionTree(this.userPermissionList);
      },
    });
  }

  public async onUpdateUserPermissionClicked(
    userPermission: UserPermission
  ): Promise<void> {
    this.updateUserPermissionUserPermissionID = userPermission.id;
    this.updateUserPermissionModalFormGroup.reset({
      permissionName: userPermission.permissionName,
      description: userPermission.description,
    });
    this.isUpdateUserPermissionModalVisible = true;
  }

  public async onUpdatePermissionModalCancel(): Promise<void> {
    this.isUpdateUserPermissionModalVisible = false;
  }

  public async onUpdatePermissionModalOk(): Promise<void> {
    const { permissionName, description } =
      this.updateUserPermissionModalFormGroup.value;

    let userPermission: UserPermission;
    try {
      userPermission =
        await this.userPermissionManagementService.updateUserPermission(
          this.updateUserPermissionUserPermissionID,
          permissionName,
          description
        );
    } catch (error) {
      if (error instanceof InvalidUserPermissionInformationError) {
        this.notificationService.error(
          'Failed to update user permission',
          'Invalid user permission information'
        );
      } else if (error instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to update user permission',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (error instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to update user permission',
          "User doesn't have the required permission"
        );
        this.router.navigateByUrl('/welcome');
      } else if (error instanceof UserPermissionNotFoundError) {
        this.notificationService.error(
          'Failed to update user permission',
          'Cannot find user permission'
        );
      } else {
        this.notificationService.error(
          'Failed to update user permission',
          'Unknown error'
        );
      }
      return;
    }

    this.notificationService.success(
      'Successfully updated user permission',
      ''
    );
    this.userPermissionList = [
      ...this.userPermissionList.filter(
        (userPermission) =>
          userPermission.id !== this.updateUserPermissionUserPermissionID
      ),
      userPermission,
    ].sort((a, b) => a.permissionName.localeCompare(b.permissionName));
    this.permissionTreeRootList = this.permissionTreeService.getPermissionTree(
      this.userPermissionList
    );
    this.isUpdateUserPermissionModalVisible = false;
  }
}
