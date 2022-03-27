import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyImagesRoutingModule } from './my-images-routing.module';
import { MyImagesComponent } from './my-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';

@NgModule({
  declarations: [MyImagesComponent],
  imports: [
    CommonModule,
    MyImagesRoutingModule,
    NzTypographyModule,
    ImageFilterOptionsSelectorModule,
  ],
  exports: [MyImagesComponent],
})
export class MyImagesModule {}
