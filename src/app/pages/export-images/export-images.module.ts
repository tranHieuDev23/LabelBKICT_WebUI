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
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { EmptyStringOnMobileModule } from 'src/app/pipes/empty-string-on-mobile/empty-string-on-mobile.module';

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
    NzButtonModule,
    NzIconModule,
    NzListModule,
    NzTagModule,
    EmptyStringOnMobileModule,
  ],
  exports: [ExportImagesComponent],
})
export class ExportImagesModule {}
