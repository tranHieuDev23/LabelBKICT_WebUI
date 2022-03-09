import { Component } from '@angular/core';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { UserManagementService } from 'src/app/services/module/user-management';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public displayName: string = '';
  public username: string = '';
  public password: string = '';
  public passwordRetype: string = '';

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly sessionManagementService: SessionManagementService
  ) {}

  public async onLoginClicked(): Promise<void> {
    this.sessionManagementService.loginWithPassword(
      this.username,
      this.password
    );
  }

  public async onRegisterClicked(): Promise<void> {
    this.userManagementService.createUser(
      this.username,
      this.displayName,
      this.password
    );
  }
}
