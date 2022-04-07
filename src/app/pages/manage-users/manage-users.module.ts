import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageUsersComponent } from './manage-users.component';
import { ManageUsersRoutingModule } from './manage-users-routing.module';
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
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UserSearchBoxModule } from 'src/app/components/user-search-box/user-search-box.module';

@NgModule({
  declarations: [ManageUsersComponent],
  imports: [
    CommonModule,
    ManageUsersRoutingModule,
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
    NzCheckboxModule,
    UserSearchBoxModule,
  ],
  exports: [ManageUsersComponent],
})
export class ManageUsersModule {}
