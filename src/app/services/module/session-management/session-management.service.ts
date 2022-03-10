import { EventEmitter, Injectable } from '@angular/core';
import {
  User,
  UserRole,
  UserPermission,
  SessionsService,
} from '../../dataaccess/api';

export class SessionUserInfo {
  constructor(
    public user: User,
    public userRoleList: UserRole[],
    public userPermissionList: UserPermission[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class SessionManagementService {
  private sessionUserInfo: SessionUserInfo | null = null;
  private readonly sessionUserInfoEventEmitter =
    new EventEmitter<SessionUserInfo | null>();

  constructor(private readonly sessionDataAccessService: SessionsService) {}

  public async loginWithPassword(
    username: string,
    password: string
  ): Promise<SessionUserInfo> {
    const sessionUserInfo =
      await this.sessionDataAccessService.loginWithPassword(username, password);
    this.setSessionUserInfo(sessionUserInfo);
    return sessionUserInfo;
  }

  public async getUserFromSession(): Promise<SessionUserInfo | null> {
    const sessionUserInfo =
      await this.sessionDataAccessService.getUserFromSession();
    this.setSessionUserInfo(sessionUserInfo);
    return this.sessionUserInfo;
  }

  public async logout(): Promise<void> {
    await this.sessionDataAccessService.logout();
    this.setSessionUserInfo(null);
  }

  public getSessionUserInfo(): SessionUserInfo | null {
    return this.sessionUserInfo;
  }

  public setSessionUserInfo(sessionUserInfo: SessionUserInfo | null): void {
    this.sessionUserInfo = sessionUserInfo;
    this.sessionUserInfoEventEmitter.emit(sessionUserInfo);
  }

  public subscribeForSessionUserInfo(
    next: (sessionUserInfo: SessionUserInfo | null) => void
  ) {
    this.sessionUserInfoEventEmitter.subscribe(next);
  }
}
