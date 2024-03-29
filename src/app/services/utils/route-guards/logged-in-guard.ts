import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { SessionManagementService } from '../../module/session-management';

@Injectable()
class UserLoggedInGuard {
  constructor(private sessionManagementService: SessionManagementService, private router: Router) {}

  public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const sessionUserInfo = await this.sessionManagementService.getUserFromSession();
    if (sessionUserInfo === null) {
      return this.router.parseUrl('/login');
    }
    if (!this.isUserAuthorized(route)) {
      return this.router.parseUrl('/welcome');
    }
    return true;
  }

  private isUserAuthorized(route: ActivatedRouteSnapshot): boolean {
    if (route.url.length === 0) {
      return true;
    }
    switch (route.url[0].path) {
      case 'manage-users':
        return this.sessionManagementService.checkSessionUserHasPermission('users.manage');
      case 'manage-roles':
        return this.sessionManagementService.checkSessionUserHasPermission('user_roles.manage');
      case 'manage-permissions':
        return this.sessionManagementService.checkSessionUserHasPermission('user_permissions.manage');
      case 'manage-tags':
        return this.sessionManagementService.checkSessionUserHasPermission('user_tags.manage');
      case 'manage-image-types':
        return this.sessionManagementService.checkSessionUserHasPermission('image_types.manage');
      case 'manage-image-tags':
        return this.sessionManagementService.checkSessionUserHasPermission('image_tags.manage');
      case 'upload-images':
        return this.sessionManagementService.checkSessionUserHasPermission('images.upload');
      case 'my-images':
        return this.sessionManagementService.checkSessionUserHasPermission('images.manage.self');
      case 'all-images':
        return this.sessionManagementService.checkSessionUserHasPermission('images.manage.all');
      case 'manage-image':
        return (
          this.sessionManagementService.checkSessionUserHasPermission('images.manage.self') ||
          this.sessionManagementService.checkSessionUserHasPermission('images.manage.all')
        );
      case 'verify-images':
      case 'verify-image':
        return this.sessionManagementService.checkSessionUserHasPermission('images.verify');
      case 'export-images':
        return this.sessionManagementService.checkSessionUserHasPermission('images.export');
      default:
        return true;
    }
  }
}

export { UserLoggedInGuard };
