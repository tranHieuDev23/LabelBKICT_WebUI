import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetectionTaskFilterOptionsSelectorComponent } from './detection-task-filter-options-selector.component';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [DetectionTaskFilterOptionsSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzSelectModule,
    NzTypographyModule,
    NzButtonModule,
    NzNotificationModule,
    NzDatePickerModule,
    NzCheckboxModule,
    NzInputModule,
  ],
  exports: [DetectionTaskFilterOptionsSelectorComponent],
})
export class DetectionTaskFilterOptionsSelectorModule {}
