import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageImageComponent } from './manage-image.component';

const routes: Routes = [{ path: ':id', component: ManageImageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageImageRoutingModule {}
