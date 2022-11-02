import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageImageTagsRoutingModule } from './manage-image-tags-routing.module';
import { ManageImageTagsComponent } from './manage-image-tags.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { EditableTextModule } from 'src/app/components/editable-text/editable-text.module';

@NgModule({
  declarations: [ManageImageTagsComponent],
  imports: [
    CommonModule,
    ManageImageTagsRoutingModule,
    NzTypographyModule,
    NzNotificationModule,
    NzModalModule,
    NzCollapseModule,
    NzButtonModule,
    NzListModule,
    NzIconModule,
    NzCheckboxModule,
    FormsModule,
    EditableTextModule,
    NzEmptyModule,
  ],
  exports: [ManageImageTagsComponent],
})
export class ManageImageTagsModule {}
