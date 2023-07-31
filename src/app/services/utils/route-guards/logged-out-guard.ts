import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SessionManagementService } from '../../module/session-management';

@Injectable()
class UserLoggedOutGuard {
  constructor(private readonly sessionManagementService: SessionManagementService, private readonly router: Router) {}

  public async canActivate(): Promise<boolean | UrlTree> {
    const sessionUserInfo = await this.sessionManagementService.getUserFromSession();
    if (sessionUserInfo === null) {
      return true;
    }
    return this.router.parseUrl('/welcome');
  }
}

export { UserLoggedOutGuard };
