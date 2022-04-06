import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PinnedPagesRoutingModule } from './pinned-pages-routing.module';
import { PinnedPagesComponent } from './pinned-pages.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzListModule } from 'ng-zorro-antd/list';
import { EditableTextModule } from 'src/app/components/editable-text/editable-text.module';
import { TruncateStringModule } from 'src/app/pipes/truncate-string/truncate-string.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@NgModule({
  declarations: [PinnedPagesComponent],
  imports: [
    CommonModule,
    PinnedPagesRoutingModule,
    NzTypographyModule,
    NzListModule,
    EditableTextModule,
    TruncateStringModule,
    NzIconModule,
    NzPaginationModule,
    NzNotificationModule,
    NzButtonModule,
    NzPopconfirmModule,
  ],
  exports: [PinnedPagesComponent],
})
export class PinnedPagesModule {}
