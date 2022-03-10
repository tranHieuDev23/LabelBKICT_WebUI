import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserPermission } from './services/dataaccess/api';
import {
  SessionManagementService,
  SessionUserInfo,
} from './services/module/session-management';

export class AppSubmenuItem {
  constructor(
    public title: string,
    public url: string,
    public onClick: () => void | Promise<void>
  ) {}
}

export class AppMenuItem {
  constructor(
    public title: string,
    public icon: string,
    public submenuItemList: AppSubmenuItem[]
  ) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public appTitle: string = 'Endoscopy Labeler';
  public menuItemList: AppMenuItem[] = [];

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly router: Router
  ) {
    this.sessionManagementService.subscribeForSessionUserInfo(
      (sessionUserInfo) => this.updateMenuItemList(sessionUserInfo)
    );
  }

  private updateMenuItemList(sessionUserInfo: SessionUserInfo | null): void {
    this.menuItemList = [];
    if (sessionUserInfo === null) {
      return;
    }

    const userPermissionSet = this.getUserPermissionNameSet(
      sessionUserInfo.userPermissionList
    );

    // Label menu
    this.menuItemList.push(new AppMenuItem('Label data', 'edit', []));

    // Settings menu
    const settingsSubmenuList: AppSubmenuItem[] = [];
    settingsSubmenuList.push(
      new AppSubmenuItem('My profile', '/my-profile', () => {})
    );
    if (userPermissionSet.has('users.write')) {
      settingsSubmenuList.push(
        new AppSubmenuItem('Manage users', '/manage-users', () => {})
      );
    }
    if (userPermissionSet.has('user_roles.write')) {
      settingsSubmenuList.push(
        new AppSubmenuItem('Manage roles', '/manage-roles', () => {})
      );
    }
    if (userPermissionSet.has('user_permissions.write')) {
      settingsSubmenuList.push(
        new AppSubmenuItem(
          'Manage permissions',
          '/manage-permissions',
          () => {}
        )
      );
    }
    settingsSubmenuList.push(
      new AppSubmenuItem('Log out', '/logout', async () => {
        await this.onLogOutClicked();
      })
    );
    this.menuItemList.push(
      new AppMenuItem('Settings', 'setting', settingsSubmenuList)
    );

    // Experimental features menu
    this.menuItemList.push(
      new AppMenuItem('Experimental features', 'experiment', [])
    );
  }

  private getUserPermissionNameSet(
    userPermissionList: UserPermission[]
  ): Set<string> {
    return new Set<string>(
      userPermissionList.map((userPermission) => userPermission.permissionName)
    );
  }

  public async onLogOutClicked(): Promise<void> {
    await this.sessionManagementService.logout();
    this.router.navigateByUrl('/login');
  }
}
