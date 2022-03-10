import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    private readonly sessionManagementService: SessionManagementService,
    private readonly router: Router
  ) {}

  public async onLoginClicked(): Promise<void> {
    try {
      await this.sessionManagementService.loginWithPassword(
        this.username,
        this.password
      );
      this.router.navigateByUrl('/welcome');
    } catch (e) {}
  }

  public async onRegisterClicked(): Promise<void> {
    if (this.password !== this.passwordRetype) {
      return;
    }

    try {
      await this.userManagementService.createUser(
        this.username,
        this.displayName,
        this.password
      );
      await this.sessionManagementService.loginWithPassword(
        this.username,
        this.password
      );
      this.router.navigateByUrl('/welcome');
    } catch (e) {}
  }
}
