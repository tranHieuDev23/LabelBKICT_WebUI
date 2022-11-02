import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllImagesRoutingModule } from './all-images-routing.module';
import { AllImagesComponent } from './all-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';

@NgModule({
  declarations: [AllImagesComponent],
  imports: [
    CommonModule,
    AllImagesRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    ImageFilterOptionsSelectorModule,
    ImageGridModule,
    NzDropDownModule,
    NzModalModule,
  ],
  exports: [AllImagesComponent],
})
export class AllImagesModule {}
