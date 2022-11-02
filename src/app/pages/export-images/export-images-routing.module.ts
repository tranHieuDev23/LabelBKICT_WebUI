import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportImagesComponent } from './export-images.component';

const routes: Routes = [{ path: '', component: ExportImagesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportImagesRoutingModule {}
