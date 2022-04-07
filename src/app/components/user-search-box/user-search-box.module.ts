import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSearchBoxComponent } from './user-search-box.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

@NgModule({
  declarations: [UserSearchBoxComponent],
  imports: [CommonModule, NzSelectModule, FormsModule, NzNotificationModule],
  exports: [UserSearchBoxComponent],
})
export class UserSearchBoxModule {}
