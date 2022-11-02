import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageImageTypesComponent } from './manage-image-types.component';

const routes: Routes = [{ path: '', component: ManageImageTypesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageImageTypesRoutingModule {}
