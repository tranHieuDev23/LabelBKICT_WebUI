import { Injectable } from '@angular/core';
import { Axios } from 'axios';
import { User, UserPermission, UserRole } from './schemas';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  constructor(private readonly axios: Axios) {}

  public async loginWithPassword(
    username: string,
    password: string
  ): Promise<{
    user: User;
    userRoleList: UserRole[];
    userPermissionList: UserPermission[];
  }> {
    throw new Error('not implemented');
  }

  public async logout(): Promise<void> {
    throw new Error('not implemented');
  }

  public async getUserFromSession(): Promise<{
    user: User;
    userRoleList: UserRole[];
    userPermissionList: UserPermission[];
  }> {
    throw new Error('not implemented');
  }
}
