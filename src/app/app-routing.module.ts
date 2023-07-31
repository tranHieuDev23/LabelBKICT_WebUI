import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLoggedInGuard } from './services/utils/route-guards/logged-in-guard';
import { UserLoggedOutGuard } from './services/utils/route-guards/logged-out-guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginModule),
    canActivate: [UserLoggedOutGuard],
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-users',
    loadChildren: () => import('./pages/manage-users/manage-users.module').then((m) => m.ManageUsersModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-roles',
    loadChildren: () => import('./pages/manage-roles/manage-roles.module').then((m) => m.ManageRolesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-permissions',
    loadChildren: () =>
      import('./pages/manage-permissions/manage-permissions.module').then((m) => m.ManagePermissionsModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-tags',
    loadChildren: () => import('./pages/manage-tags/manage-tags.module').then((m) => m.ManageRolesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-image-types',
    loadChildren: () =>
      import('./pages/manage-image-types/manage-image-types.module').then((m) => m.ManageImageTypesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-image-tags',
    loadChildren: () =>
      import('./pages/manage-image-tags/manage-image-tags.module').then((m) => m.ManageImageTagsModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'upload-images',
    loadChildren: () => import('./pages/upload-images/upload-images.module').then((m) => m.UploadImagesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'my-images',
    loadChildren: () => import('./pages/my-images/my-images.module').then((m) => m.MyImagesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'all-images',
    loadChildren: () => import('./pages/all-images/all-images.module').then((m) => m.AllImagesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'manage-image',
    loadChildren: () => import('./pages/manage-image/manage-image.module').then((m) => m.ManageImageModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'verify-images',
    loadChildren: () => import('./pages/verify-images/verify-images.module').then((m) => m.VerifyImagesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'verify-image',
    loadChildren: () => import('./pages/verify-image/verify-image.module').then((m) => m.VerifyImageModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'export-images',
    loadChildren: () => import('./pages/export-images/export-images.module').then((m) => m.ExportImagesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'pinned-pages',
    loadChildren: () => import('./pages/pinned-pages/pinned-pages.module').then((m) => m.PinnedPagesModule),
    canActivate: [UserLoggedInGuard],
  },
  {
    path: 'detection-tasks',
    loadChildren: () => import('./pages/detection-tasks/detection-tasks.module').then((m) => m.DetectionTasksModule),
    canActivate: [UserLoggedInGuard],
  },
  { path: '**', pathMatch: 'full', redirectTo: '/welcome' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
