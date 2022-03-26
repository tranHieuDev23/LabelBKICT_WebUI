import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyImagesRoutingModule } from './my-images-routing.module';
import { MyImagesComponent } from './my-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [MyImagesComponent],
  imports: [CommonModule, MyImagesRoutingModule, NzTypographyModule],
  exports: [MyImagesComponent],
})
export class MyImagesModule {}
