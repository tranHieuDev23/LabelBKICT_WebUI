import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageImageTypesComponent } from './manage-image-types.component';
import { ManageImageTypesRoutingModule } from './manage-image-types-routing.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [ManageImageTypesComponent],
  imports: [CommonModule, ManageImageTypesRoutingModule, NzTypographyModule],
  exports: [ManageImageTypesComponent],
})
export class ManageImageTypesModule {}
