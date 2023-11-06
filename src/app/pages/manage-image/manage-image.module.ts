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
import { RegionOperationLogListModule } from 'src/app/components/region-operation-log-list/region-operation-log-list.module';
import { RegionListModule } from 'src/app/components/region-list/region-list.module';
import { EditableRichTextModule } from 'src/app/components/editable-rich-text/editable-rich-text.module';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UserSearchBoxModule } from 'src/app/components/user-search-box/user-search-box.module';

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
    EditableRichTextModule,
    NzCollapseModule,
    NzListModule,
    RegionOperationLogListModule,
    RegionListModule,
    NzPaginationModule,
    NzCheckboxModule,
    UserSearchBoxModule,
  ],
  exports: [ManageImageComponent],
})
export class ManageImageModule {}
