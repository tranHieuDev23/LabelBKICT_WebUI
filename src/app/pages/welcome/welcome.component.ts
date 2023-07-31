import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionManagementService, SessionUserInfo } from 'src/app/services/module/session-management';

export class WelcomeSubmenuItem {
  constructor(public title: string, public url: string) {}
}

export class WelcomeMenuItem {
  constructor(public title: string, public icon: string, public submenuItemList: WelcomeSubmenuItem[]) {}
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  public sessionUserInfo: SessionUserInfo | null = null;
  public menuItemList: WelcomeMenuItem[] = [];

  constructor(private readonly sessionManagementService: SessionManagementService, private readonly router: Router) {}

  ngOnInit(): void {
    (async () => {
      this.sessionUserInfo = await this.sessionManagementService.getUserFromSession();
      if (this.sessionUserInfo === null) {
        this.router.navigateByUrl('/login');
        return;
      }
      this.updateMenuItemList(this.sessionUserInfo);
    })().then(
      () => {},
      () => {}
    );
  }

  private updateMenuItemList(sessionUserInfo: SessionUserInfo): void {
    this.menuItemList = [];

    // Label images
    if (this.isLabelImagesMenuItemAvailable()) {
      const submenuItemList: WelcomeSubmenuItem[] = [];
      if (this.sessionManagementService.checkSessionUserHasPermission('images.upload')) {
        submenuItemList.push(new WelcomeSubmenuItem('Upload images', '/upload-images'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('images.manage.self')) {
        submenuItemList.push(new WelcomeSubmenuItem('My images', '/my-images'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('images.manage.all')) {
        submenuItemList.push(new WelcomeSubmenuItem('All images', '/all-images'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('images.verify')) {
        submenuItemList.push(new WelcomeSubmenuItem('Verify images', '/verify-images'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('images.export')) {
        submenuItemList.push(new WelcomeSubmenuItem('Export images', '/export-images'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('images.manage.all')) {
        submenuItemList.push(new WelcomeSubmenuItem('Detection tasks', '/detection-tasks'));
      }
      this.menuItemList.push(new WelcomeMenuItem('Label images', 'edit', submenuItemList));
    }

    // Pinned pages
    this.menuItemList.push(
      new WelcomeMenuItem('Pinned pages', 'pushpin', [new WelcomeSubmenuItem('My pinned pages', '/pinned-pages')])
    );

    // User settings
    if (this.isUserSettingsMenuItemAvailable()) {
      const submenuItemList: WelcomeSubmenuItem[] = [];
      if (this.sessionManagementService.checkSessionUserHasPermission('users.manage')) {
        submenuItemList.push(new WelcomeSubmenuItem('Manage users', '/manage-users'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('user_roles.manage')) {
        submenuItemList.push(new WelcomeSubmenuItem('Manage user roles', '/manage-roles'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('user_permissions.manage')) {
        submenuItemList.push(new WelcomeSubmenuItem('Manage user permissions', '/manage-permissions'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('user_tags.manage')) {
        submenuItemList.push(new WelcomeSubmenuItem('Manage user tags', '/manage-tags'));
      }
      this.menuItemList.push(new WelcomeMenuItem('User settings', 'user', submenuItemList));
    }

    // Image settings
    if (this.isImageSettingsMenuItemAvailable()) {
      const submenuItemList: WelcomeSubmenuItem[] = [];
      if (this.sessionManagementService.checkSessionUserHasPermission('image_types.manage')) {
        submenuItemList.push(new WelcomeSubmenuItem('Manage image types', '/manage-image-types'));
      }
      if (this.sessionManagementService.checkSessionUserHasPermission('image_tags.manage')) {
        submenuItemList.push(new WelcomeSubmenuItem('Manage image tags', '/manage-image-tags'));
      }
      this.menuItemList.push(new WelcomeMenuItem('Image settings', 'picture', submenuItemList));
    }
  }

  private isLabelImagesMenuItemAvailable(): boolean {
    return (
      this.sessionManagementService.checkSessionUserHasPermission('images.upload') ||
      this.sessionManagementService.checkSessionUserHasPermission('images.manage.self') ||
      this.sessionManagementService.checkSessionUserHasPermission('images.manage.all') ||
      this.sessionManagementService.checkSessionUserHasPermission('images.verify') ||
      this.sessionManagementService.checkSessionUserHasPermission('images.export')
    );
  }

  private isImageSettingsMenuItemAvailable(): boolean {
    return (
      this.sessionManagementService.checkSessionUserHasPermission('image_types.manage') ||
      this.sessionManagementService.checkSessionUserHasPermission('image_tags.manage')
    );
  }

  private isUserSettingsMenuItemAvailable(): boolean {
    return (
      this.sessionManagementService.checkSessionUserHasPermission('users.manage') ||
      this.sessionManagementService.checkSessionUserHasPermission('user_roles.manage') ||
      this.sessionManagementService.checkSessionUserHasPermission('user_permissions.manage') ||
      this.sessionManagementService.checkSessionUserHasPermission('user_tags.manage')
    );
  }
}
