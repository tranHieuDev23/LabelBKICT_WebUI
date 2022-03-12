import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLoggedInGuard } from './services/utils/route-guards/logged-in-guard';
import { UserLoggedOutGuard } from './services/utils/route-guards/logged-out-guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
    canActivate: [UserLoggedOutGuard],
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-users',
    loadChildren: () =>
      import('./pages/manage-users/manage-users.module').then(
        (m) => m.ManageUsersModule
      ),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-roles',
    loadChildren: () =>
      import('./pages/manage-roles/manage-roles.module').then(
        (m) => m.ManageRolesModule
      ),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-permissions',
    loadChildren: () =>
      import('./pages/manage-permissions/manage-permissions.module').then(
        (m) => m.ManagePermissionsModule
      ),
    canActivate: [UserLoggedInGuard],
  },
  { path: '**', pathMatch: 'full', redirectTo: '/welcome' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
