import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageImageTagsRoutingModule } from './manage-image-tags-routing.module';
import { ManageImageTagsComponent } from './manage-image-tags.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [ManageImageTagsComponent],
  imports: [CommonModule, ManageImageTagsRoutingModule, NzTypographyModule],
  exports: [ManageImageTagsComponent],
})
export class ManageImageTagsModule {}
