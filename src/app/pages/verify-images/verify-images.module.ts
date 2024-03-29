import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerifyImagesRoutingModule } from './verify-images-routing.module';
import { VerifyImagesComponent } from './verify-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

@NgModule({
  declarations: [VerifyImagesComponent],
  imports: [
    CommonModule,
    VerifyImagesRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    ImageFilterOptionsSelectorModule,
    ImageGridModule,
    NzDropDownModule,
  ],
  exports: [VerifyImagesComponent],
})
export class VerifyImagesModule {}
