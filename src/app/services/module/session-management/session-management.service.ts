import { EventEmitter, Injectable } from '@angular/core';
import {
  User,
  UserRole,
  UserPermission,
  SessionsService,
} from '../../dataaccess/api';

export class SessionUserInfo {
  constructor(
    public readonly user: User,
    public readonly userRoleList: UserRole[],
    public readonly userPermissionList: UserPermission[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class SessionManagementService {
  public readonly sessionUser: EventEmitter<SessionUserInfo> =
    new EventEmitter<SessionUserInfo>();

  constructor(private readonly sessionDataAccessService: SessionsService) {}

  public async loginWithPassword(
    username: string,
    password: string
  ): Promise<SessionUserInfo> {
    throw new Error('not implemented');
  }

  public async getUserFromSession(): Promise<SessionUserInfo> {
    throw new Error('not implemented');
  }

  public async logout(): Promise<void> {}
}
