import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagePermissionsComponent } from './manage-permissions.component';
import { ManagePermissionsRoutingModule } from './manage-permissions-routing.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@NgModule({
  declarations: [ManagePermissionsComponent],
  imports: [
    CommonModule,
    ManagePermissionsRoutingModule,
    NzTypographyModule,
    NzTreeModule,
    NzNotificationModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
  ],
  exports: [ManagePermissionsComponent],
})
export class ManagePermissionsModule {}
