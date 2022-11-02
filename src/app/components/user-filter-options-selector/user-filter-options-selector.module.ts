import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { UserFilterOptionsSelectorComponent } from './user-filter-options-selector.component';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';

@NgModule({
  declarations: [UserFilterOptionsSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzSelectModule,
    NzTypographyModule,
    NzInputModule,
  ],
  exports: [UserFilterOptionsSelectorComponent],
})
export class UserFilterOptionsSelectorModule {}
