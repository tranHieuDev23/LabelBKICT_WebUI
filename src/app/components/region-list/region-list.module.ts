import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionListComponent } from './region-list.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [RegionListComponent],
  imports: [CommonModule, NzTableModule, NzTagModule],
  exports: [RegionListComponent],
})
export class RegionListModule {}
