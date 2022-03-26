import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageImageTypesComponent } from './manage-image-types.component';
import { ManageImageTypesRoutingModule } from './manage-image-types-routing.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { ColorBoxModule } from 'src/app/components/color-box/color-box.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { EditableTextModule } from 'src/app/components/editable-text/editable-text.module';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@NgModule({
  declarations: [ManageImageTypesComponent],
  imports: [
    CommonModule,
    ManageImageTypesRoutingModule,
    NzTypographyModule,
    NzNotificationModule,
    NzModalModule,
    NzCollapseModule,
    NzButtonModule,
    NzListModule,
    ColorBoxModule,
    NzIconModule,
    NzCheckboxModule,
    FormsModule,
    EditableTextModule,
    NzEmptyModule,
  ],
  exports: [ManageImageTypesComponent],
})
export class ManageImageTypesModule {}
