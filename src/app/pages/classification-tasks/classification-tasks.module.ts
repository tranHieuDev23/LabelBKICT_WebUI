import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassificationTasksRoutingModule } from './classification-tasks-routing.module';
import { ClassificationTasksComponent } from './classification-tasks.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ClassificationTaskFilterOptionsSelectorModule } from 'src/app/components/classification-task-filter-options-selector/classification-task-filter-options-selector.module';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [ClassificationTasksComponent],
  imports: [
    CommonModule,
    ClassificationTasksRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    NzTableModule,
    NzTagModule,
    ClassificationTaskFilterOptionsSelectorModule,
  ],
  exports: [ClassificationTasksComponent],
})
export class ClassificationTasksModule {}
