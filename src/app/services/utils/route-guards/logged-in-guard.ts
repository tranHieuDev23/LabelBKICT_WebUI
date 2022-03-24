import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { UserPermission } from '../../dataaccess/api';
import {
  SessionManagementService,
  SessionUserInfo,
} from '../../module/session-management';

@Injectable()
class UserLoggedInGuard implements CanActivate {
  constructor(
    private sessionManagementService: SessionManagementService,
    private router: Router
  ) {}

  public async canActivate(
    route: ActivatedRouteSnapshot
  ): Promise<boolean | UrlTree> {
    const sessionUserInfo =
      await this.sessionManagementService.getUserFromSession();
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
        return this.sessionManagementService.checkSessionUserHasPermission(
          'users.manage'
        );
      case 'manage-roles':
        return this.sessionManagementService.checkSessionUserHasPermission(
          'user_roles.manage'
        );
      case 'manage-permissions':
        return this.sessionManagementService.checkSessionUserHasPermission(
          'user_permissions.manage'
        );
      case 'manage-image-types':
        return this.sessionManagementService.checkSessionUserHasPermission(
          'image_types.manage'
        );
      case 'manage-image-tags':
        return this.sessionManagementService.checkSessionUserHasPermission(
          'image_tags.manage'
        );
      default:
        return true;
    }
  }
}

export { UserLoggedInGuard };
