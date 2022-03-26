import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadImagesRoutingModule } from './upload-images-routing.module';
import { UploadImagesComponent } from './upload-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [UploadImagesComponent],
  imports: [CommonModule, UploadImagesRoutingModule, NzTypographyModule],
  exports: [UploadImagesComponent],
})
export class UploadImagesModule {}
