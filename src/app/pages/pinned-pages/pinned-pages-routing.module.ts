import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PinnedPagesComponent } from './pinned-pages.component';

const routes: Routes = [{ path: '', component: PinnedPagesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PinnedPagesRoutingModule {}
