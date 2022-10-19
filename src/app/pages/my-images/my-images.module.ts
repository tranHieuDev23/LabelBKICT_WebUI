import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyImagesRoutingModule } from './my-images-routing.module';
import { MyImagesComponent } from './my-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@NgModule({
  declarations: [MyImagesComponent],
  imports: [
    CommonModule,
    MyImagesRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    ImageFilterOptionsSelectorModule,
    FormsModule,
    NzGridModule,
    ImageGridModule,
    NzDropDownModule,
    NzModalModule,
    NzCheckboxModule,
  ],
  exports: [MyImagesComponent],
})
export class MyImagesModule {}
