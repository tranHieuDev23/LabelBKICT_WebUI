import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExportImagesRoutingModule } from './export-images-routing.module';
import { ExportImagesComponent } from './export-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@NgModule({
  declarations: [ExportImagesComponent],
  imports: [
    CommonModule,
    ExportImagesRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    ImageFilterOptionsSelectorModule,
    ImageGridModule,
    NzDropDownModule,
    NzModalModule,
    NzTabsModule,
  ],
  exports: [ExportImagesComponent],
})
export class ExportImagesModule {}
