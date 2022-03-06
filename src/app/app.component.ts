import { Component } from '@angular/core';

export class AppSubmenuItem {
  constructor(public title: string, public url: string) {}
}

export class AppMenuItem {
  constructor(
    public title: string,
    public icon: string,
    public submenuItemList: AppSubmenuItem[]
  ) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public appTitle: string = 'Endoscopy Labeler';
  public menuItemList: AppMenuItem[] = [
    new AppMenuItem('Label data', 'edit', []),
    new AppMenuItem('Settings', 'setting', [
      new AppSubmenuItem('My profile', '/my-profile'),
      new AppSubmenuItem('Manage users', '/manage-users'),
      new AppSubmenuItem('Manage roles', '/manage-roles'),
      new AppSubmenuItem('Manage permissions', '/manage-permissions'),
      new AppSubmenuItem('Log out', '/logout'),
    ]),
    new AppMenuItem('Experimental features', 'experiment', []),
  ];
}
