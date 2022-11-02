import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerifyImagesComponent } from './verify-images.component';

const routes: Routes = [{ path: '', component: VerifyImagesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyImagesRoutingModule {}
