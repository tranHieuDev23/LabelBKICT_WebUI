import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  SessionManagementService,
  SessionUserInfo,
} from 'src/app/services/module/session-management';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  public sessionUserInfo: SessionUserInfo | null = null;

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      this.sessionUserInfo =
        await this.sessionManagementService.getUserFromSession();
      if (this.sessionUserInfo === null) {
        this.router.navigateByUrl('/login');
        return;
      }
    })().then(
      () => {},
      (error) => {}
    );
  }
}
