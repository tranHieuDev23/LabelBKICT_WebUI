import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetectionTasksRoutingModule } from './detection-tasks-routing.module';
import { DetectionTasksComponent } from './detection-tasks.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { DetectionTaskFilterOptionsSelectorModule } from 'src/app/components/detection-task-filter-options-selector/detection-task-filter-options-selector.module';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [DetectionTasksComponent],
  imports: [
    CommonModule,
    DetectionTasksRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    NzTableModule,
    NzTagModule,
    DetectionTaskFilterOptionsSelectorModule,
  ],
  exports: [DetectionTasksComponent],
})
export class DetectionTasksModule {}
