import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageRolesComponent } from './manage-roles.component';
import { ManageRolesRoutingModule } from './manage-roles-routing.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzTreeModule } from 'ng-zorro-antd/tree';

@NgModule({
  declarations: [ManageRolesComponent],
  imports: [
    CommonModule,
    ManageRolesRoutingModule,
    NzButtonModule,
    NzCollapseModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzListModule,
    NzModalModule,
    NzTypographyModule,
    NzPaginationModule,
    NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NzNotificationModule,
    NzTreeModule,
  ],
  exports: [ManageRolesComponent],
})
export class ManageRolesModule {}
