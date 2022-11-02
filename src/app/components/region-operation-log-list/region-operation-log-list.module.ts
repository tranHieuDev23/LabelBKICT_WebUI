import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionOperationLogListComponent } from './region-operation-log-list.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@NgModule({
  declarations: [RegionOperationLogListComponent],
  imports: [CommonModule, NzTypographyModule, NzListModule, NzPaginationModule],
  exports: [RegionOperationLogListComponent],
})
export class RegionOperationLogListModule {}
