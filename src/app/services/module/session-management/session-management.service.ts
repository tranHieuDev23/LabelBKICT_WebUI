import { EventEmitter, Injectable } from '@angular/core';
import { User, UserRole, UserPermission, SessionsService } from '../../dataaccess/api';
import { UnauthenticatedError } from '../../dataaccess/api/errors';

export class SessionUserInfo {
  constructor(public user: User, public userRoleList: UserRole[], public userPermissionList: UserPermission[]) {}
}

@Injectable({
  providedIn: 'root',
})
export class SessionManagementService {
  private sessionUserInfo: SessionUserInfo | null | undefined = undefined;
  private sessionUserPermissionNameSet: Set<string> = new Set<string>();
  private readonly sessionUserInfoEventEmitter = new EventEmitter<SessionUserInfo | null>();

  constructor(private readonly sessionDataAccessService: SessionsService) {}

  public isValidPassword(password: string): { [k: string]: boolean } | null {
    if (0 < password.length && password.length < 8) {
      return { error: true, minLength: true };
    }
    return null;
  }

  public checkSessionUserHasPermission(permissionName: string): boolean {
    return this.sessionUserPermissionNameSet.has(permissionName);
  }

  public async loginWithPassword(username: string, password: string): Promise<SessionUserInfo> {
    const sessionUserInfo = await this.sessionDataAccessService.loginWithPassword(username, password);
    this.setSessionUserInfo(sessionUserInfo);
    return sessionUserInfo;
  }

  public async getUserFromSession(): Promise<SessionUserInfo | null> {
    if (this.sessionUserInfo !== undefined) {
      return this.sessionUserInfo;
    }
    try {
      const sessionUserInfo = await this.sessionDataAccessService.getUserFromSession();
      this.setSessionUserInfo(sessionUserInfo);
      return sessionUserInfo;
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.setSessionUserInfo(null);
        return null;
      }
      throw e;
    }
  }

  public async logout(): Promise<void> {
    await this.sessionDataAccessService.logout();
    this.setSessionUserInfo(null);
  }

  public setSessionUserInfo(sessionUserInfo: SessionUserInfo | null): void {
    this.sessionUserInfo = sessionUserInfo;
    this.sessionUserPermissionNameSet = new Set(
      sessionUserInfo?.userPermissionList.map((userPermission) => userPermission.permissionName)
    );
    this.sessionUserInfoEventEmitter.emit(sessionUserInfo);
  }

  public subscribeForSessionUserInfo(next: (sessionUserInfo: SessionUserInfo | null) => void) {
    this.sessionUserInfoEventEmitter.subscribe(next);
  }
}
