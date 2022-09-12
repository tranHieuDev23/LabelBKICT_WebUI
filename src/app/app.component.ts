import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  InvalidPinnedPageInformationError,
  UnauthenticatedError,
} from './services/dataaccess/api';
import { PinnedPageManagementService } from './services/module/pinned-page-management/pinned-page-management.service';
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
  public appTitle = 'Endoscopy Labeler';
  public isUserLoggedIn = false;
  public menuItemList: AppMenuItem[] = [];

  public isPinningPage = false;
  public pinPageDescription = '';

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly pinnedPageManagementService: PinnedPageManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router
  ) {
    this.sessionManagementService.subscribeForSessionUserInfo(
      (sessionUserInfo) => this.onSessionUserInfoChanged(sessionUserInfo)
    );
  }

  private onSessionUserInfoChanged(
    sessionUserInfo: SessionUserInfo | null
  ): void {
    if (sessionUserInfo === null) {
      this.isUserLoggedIn = false;
      this.menuItemList = [];
    } else {
      this.isUserLoggedIn = true;
      this.updateMenuItemList(sessionUserInfo);
    }
  }

  private updateMenuItemList(sessionUserInfo: SessionUserInfo): void {
    this.menuItemList = [];
    // Label menu
    const labelSubmenuList: AppSubmenuItem[] = [];
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'images.upload'
      )
    ) {
      labelSubmenuList.push(
        new AppSubmenuItem('Upload images', '/upload-images', () => {})
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'images.manage.self'
      )
    ) {
      labelSubmenuList.push(
        new AppSubmenuItem('My images', '/my-images', () => {})
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'images.manage.all'
      )
    ) {
      labelSubmenuList.push(
        new AppSubmenuItem('All images', '/all-images', () => {})
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'images.verify'
      )
    ) {
      labelSubmenuList.push(
        new AppSubmenuItem('Verify images', '/verify-images', () => {})
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'images.export'
      )
    ) {
      labelSubmenuList.push(
        new AppSubmenuItem('Export images', '/export-images', () => {})
      );
    }
    this.menuItemList.push(
      new AppMenuItem('Label data', 'edit', labelSubmenuList)
    );

    // Settings menu
    const settingsSubmenuList: AppSubmenuItem[] = [];
    settingsSubmenuList.push(
      new AppSubmenuItem('My pinned pages', '/pinned-pages', () => {})
    );
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'users.manage'
      )
    ) {
      settingsSubmenuList.push(
        new AppSubmenuItem('Manage users', '/manage-users', () => {})
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'user_roles.manage'
      )
    ) {
      settingsSubmenuList.push(
        new AppSubmenuItem('Manage user roles', '/manage-roles', () => {})
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'user_permissions.manage'
      )
    ) {
      settingsSubmenuList.push(
        new AppSubmenuItem(
          'Manage user permissions',
          '/manage-permissions',
          () => {}
        )
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'user_tags.manage'
      )
    ) {
      settingsSubmenuList.push(
        new AppSubmenuItem('Manage user tags', '/manage-tags', () => {})
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'image_types.manage'
      )
    ) {
      settingsSubmenuList.push(
        new AppSubmenuItem(
          'Manage image types',
          '/manage-image-types',
          () => {}
        )
      );
    }
    if (
      this.sessionManagementService.checkSessionUserHasPermission(
        'image_tags.manage'
      )
    ) {
      settingsSubmenuList.push(
        new AppSubmenuItem('Manage image tags', '/manage-image-tags', () => {})
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
  }

  public async onLogOutClicked(): Promise<void> {
    if (!this.isUserLoggedIn) {
      return;
    }
    await this.sessionManagementService.logout();
    this.router.navigateByUrl('/login');
  }

  public async onPinThisPageClicked(): Promise<void> {
    this.isPinningPage = true;
    try {
      await this.pinnedPageManagementService.createPinnedPage(
        this.router.url,
        this.pinPageDescription
      );
      this.notificationService.success('Pinned page successfully', '');
      this.pinPageDescription = '';
    } catch (e) {
      if (e instanceof InvalidPinnedPageInformationError) {
        this.notificationService.error('Failed to pin page', 'Invalid URL');
      } else if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to pin page',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else {
        this.notificationService.error('Failed to pin page', 'Unknown error');
      }
    } finally {
      this.isPinningPage = false;
    }
  }
}
