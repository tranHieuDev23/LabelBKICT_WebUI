import { User } from './user';

export class UserCanVerifyUserImage {
  constructor(public user: User) {}

  public static fromJSON(userCanVerifyUserImageJSON: any): UserCanVerifyUserImage {
    return new UserCanVerifyUserImage(User.fromJSON(userCanVerifyUserImageJSON.user));
  }
}
