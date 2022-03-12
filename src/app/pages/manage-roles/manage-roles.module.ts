import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageRolesComponent } from './manage-roles.component';
import { ManageRolesRoutingModule } from './manage-roles-routing.module';

@NgModule({
  declarations: [ManageRolesComponent],
  imports: [CommonModule, ManageRolesRoutingModule],
  exports: [ManageRolesComponent],
})
export class ManageRolesModule {}
