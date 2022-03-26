import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllImagesRoutingModule } from './all-images-routing.module';
import { AllImagesComponent } from './all-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [AllImagesComponent],
  imports: [CommonModule, AllImagesRoutingModule, NzTypographyModule],
  exports: [AllImagesComponent],
})
export class AllImagesModule {}
