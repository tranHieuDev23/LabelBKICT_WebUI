import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserPermission } from 'src/app/services/dataaccess/api';
import {
  SessionManagementService,
  SessionUserInfo,
} from 'src/app/services/module/session-management';

export class WelcomeSubmenuItem {
  constructor(public title: string, public url: string) {}
}

export class WelcomeMenuItem {
  constructor(
    public title: string,
    public icon: string,
    public submenuItemList: WelcomeSubmenuItem[]
  ) {}
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  public sessionUserInfo: SessionUserInfo | null = null;
  public menuItemList: WelcomeMenuItem[] = [];

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const sessionUserInfo = this.sessionManagementService.getSessionUserInfo();
    if (sessionUserInfo === null) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.sessionUserInfo = sessionUserInfo;
    this.updateMenuItemList(sessionUserInfo);
  }

  private updateMenuItemList(sessionUserInfo: SessionUserInfo): void {
    this.menuItemList = [];
    const userPermissionNameSet = this.getUserPermissionNameSet(
      sessionUserInfo.userPermissionList
    );

    // User management
    if (this.isUserManagementMenuItemAvailable(userPermissionNameSet)) {
      const submenuItemList: WelcomeSubmenuItem[] = [];
      if (userPermissionNameSet.has('users.write')) {
        submenuItemList.push(
          new WelcomeSubmenuItem('Manage users', '/manage-users')
        );
      }
      if (userPermissionNameSet.has('user_roles.write')) {
        submenuItemList.push(
          new WelcomeSubmenuItem('Manage user roles', '/manage-roles')
        );
      }
      if (userPermissionNameSet.has('user_permissions.write')) {
        submenuItemList.push(
          new WelcomeSubmenuItem(
            'Manage user permissions',
            '/manage-permissions'
          )
        );
      }
      this.menuItemList.push(
        new WelcomeMenuItem('User management', 'user', submenuItemList)
      );
    }
  }

  private getUserPermissionNameSet(
    userPermissionList: UserPermission[]
  ): Set<string> {
    return new Set<string>(
      userPermissionList.map((userPermission) => userPermission.permissionName)
    );
  }

  private isUserManagementMenuItemAvailable(
    userPermissionNameSet: Set<string>
  ): boolean {
    return (
      userPermissionNameSet.has('users.write') ||
      userPermissionNameSet.has('user_roles.write') ||
      userPermissionNameSet.has('user_permissions.write')
    );
  }
}
