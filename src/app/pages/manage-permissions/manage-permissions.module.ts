import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagePermissionsComponent } from './manage-permissions.component';
import { ManagePermissionsRoutingModule } from './manage-permissions-routing.module';

@NgModule({
  declarations: [ManagePermissionsComponent],
  imports: [CommonModule, ManagePermissionsRoutingModule],
  exports: [ManagePermissionsComponent],
})
export class ManagePermissionsModule {}
