import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageImageRoutingModule } from './manage-image-routing.module';
import { ManageImageComponent } from './manage-image.component';
import { RegionSelectorModule } from 'src/app/components/region-selector/region-selector.module';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { EditableTagListModule } from 'src/app/components/editable-tag-list/editable-tag-list.module';
import { EditableTextModule } from 'src/app/components/editable-text/editable-text.module';

@NgModule({
  declarations: [ManageImageComponent],
  imports: [
    CommonModule,
    ManageImageRoutingModule,
    RegionSelectorModule,
    NzButtonModule,
    NzIconModule,
    NzTypographyModule,
    NzNotificationModule,
    RegionSelectorModule,
    NzModalModule,
    NzDropDownModule,
    NzGridModule,
    NzSkeletonModule,
    NzTagModule,
    NzSelectModule,
    FormsModule,
    EditableTagListModule,
    EditableTextModule,
    NzCollapseModule,
    NzListModule,
  ],
  exports: [ManageImageComponent],
})
export class ManageImageModule {}
