import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  IncorrectPasswordError,
  InvalidUserInformationError,
  UsernameNotFoundError,
  UsernameTakenError,
} from 'src/app/services/dataaccess/api';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { UserManagementService } from 'src/app/services/module/user-management';
import { ConfirmedValidator } from 'src/app/services/utils/confirmed-validator/confirmed-validator';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public loginForm: FormGroup;
  public registerForm: FormGroup;

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router,
    formBuilder: FormBuilder
  ) {
    this.loginForm = formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.loginForm.reset({ username: '', password: '' });
    this.registerForm = formBuilder.group(
      {
        displayName: ['', [Validators.required, this.displayNameValidator()]],
        username: ['', [Validators.required, this.usernameValidator()]],
        password: ['', [Validators.required, this.passwordValidator()]],
        passwordConfirm: ['', [Validators.required]],
      },
      {
        validators: [ConfirmedValidator('password', 'passwordConfirm')],
      }
    );
    this.registerForm.reset({
      displayName: '',
      username: '',
      password: '',
      passwordType: '',
    });
  }

  private usernameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const username: string = control.value;
      return this.userManagementService.isValidUsername(username);
    };
  }

  private displayNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const displayName: string = control.value;
      return this.userManagementService.isValidDisplayName(displayName);
    };
  }

  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      const password: string = control.value;
      return this.sessionManagementService.isValidPassword(password);
    };
  }

  public async onLoginClicked(): Promise<void> {
    const { username, password } = this.loginForm.value;
    try {
      const { user } = await this.sessionManagementService.loginWithPassword(
        username,
        password
      );
      this.notificationService.success(
        'Logged in successfully',
        `Welcome, ${user.displayName}`
      );
    } catch (e) {
      if (e instanceof IncorrectPasswordError) {
        this.notificationService.error(
          'Failed to log in',
          'Incorrect password'
        );
      } else if (e instanceof UsernameNotFoundError) {
        this.notificationService.error(
          'Failed to log in',
          'No user with the provided username found'
        );
      } else {
        this.notificationService.error('Failed to log in', 'Unknown error');
      }
      return;
    }
    this.router.navigateByUrl('/welcome');
  }

  public async onRegisterClicked(): Promise<void> {
    const { displayName, username, password } = this.registerForm.value;
    try {
      const user = await this.userManagementService.createUser(
        username,
        displayName,
        password
      );
      this.notificationService.success(
        'Registered successfully',
        `Welcome, ${user.displayName}`
      );
    } catch (e) {
      if (e instanceof InvalidUserInformationError) {
        this.notificationService.error(
          'Failed to register',
          'Invalid user information'
        );
      } else if (e instanceof UsernameTakenError) {
        this.notificationService.error(
          'Failed to register',
          'Username is already taken'
        );
      } else {
        this.notificationService.error('Failed to register', 'Unknown error');
      }
      return;
    }

    try {
      await this.sessionManagementService.loginWithPassword(username, password);
    } catch (e) {
      if (e instanceof IncorrectPasswordError) {
        this.notificationService.error(
          'Failed to log in',
          'Incorrect password'
        );
      } else if (e instanceof UsernameNotFoundError) {
        this.notificationService.error(
          'Failed to log in',
          'No user with the provided username found'
        );
      } else {
        this.notificationService.error('Failed to log in', 'Unknown error');
      }
      return;
    }

    this.router.navigateByUrl('/welcome');
  }
}
