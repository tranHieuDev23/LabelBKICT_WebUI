import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
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
    if (!this.isUserAuthorized(route, sessionUserInfo)) {
      return this.router.parseUrl('/welcome');
    }
    return true;
  }

  private isUserAuthorized(
    route: ActivatedRouteSnapshot,
    sessionUserInfo: SessionUserInfo
  ): boolean {
    if (route.url.length === 0) {
      return true;
    }
    switch (route.url[0].path) {
      default:
        return true;
    }
  }
}

export { UserLoggedInGuard };
