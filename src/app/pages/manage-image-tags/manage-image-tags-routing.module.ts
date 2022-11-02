import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageImageTagsComponent } from './manage-image-tags.component';

const routes: Routes = [{ path: '', component: ManageImageTagsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageImageTagsRoutingModule {}
