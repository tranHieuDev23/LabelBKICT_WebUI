import { User } from './user';

export class UserCanManageUserImage {
  constructor(public user: User, public canEdit: boolean) {}

  public static fromJSON(userCanManageUserImageJSON: any): UserCanManageUserImage {
    return new UserCanManageUserImage(
      User.fromJSON(userCanManageUserImageJSON.user),
      userCanManageUserImageJSON.can_edit || false
    );
  }
}
