import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageTagsComponent } from './manage-tags.component';

const routes: Routes = [{ path: '', component: ManageTagsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageRolesRoutingModule {}
