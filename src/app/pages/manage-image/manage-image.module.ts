import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageImageRoutingModule } from './manage-image-routing.module';
import { ManageImageComponent } from './manage-image.component';

@NgModule({
  declarations: [ManageImageComponent],
  imports: [CommonModule, ManageImageRoutingModule],
  exports: [ManageImageComponent],
})
export class ManageImageModule {}
