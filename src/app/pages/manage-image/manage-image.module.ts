import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageImageRoutingModule } from './manage-image-routing.module';
import { ManageImageComponent } from './manage-image.component';
import { RegionSelectorModule } from 'src/app/components/region-selector/region-selector.module';

@NgModule({
  declarations: [ManageImageComponent],
  imports: [CommonModule, ManageImageRoutingModule, RegionSelectorModule],
  exports: [ManageImageComponent],
})
export class ManageImageModule {}
