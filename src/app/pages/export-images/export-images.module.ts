import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExportImagesRoutingModule } from './export-images-routing.module';
import { ExportImagesComponent } from './export-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [ExportImagesComponent],
  imports: [CommonModule, ExportImagesRoutingModule, NzTypographyModule],
  exports: [ExportImagesComponent],
})
export class ExportImagesModule {}
