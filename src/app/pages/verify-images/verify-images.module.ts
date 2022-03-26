import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerifyImagesRoutingModule } from './verify-images-routing.module';
import { VerifyImagesComponent } from './verify-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [VerifyImagesComponent],
  imports: [CommonModule, VerifyImagesRoutingModule, NzTypographyModule],
  exports: [VerifyImagesComponent],
})
export class VerifyImagesModule {}
