import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagePermissionsComponent } from './manage-permissions.component';

const routes: Routes = [{ path: '', component: ManagePermissionsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagePermissionsRoutingModule {}
