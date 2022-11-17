import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageTagSelectComponent } from './image-tag-select.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [ImageTagSelectComponent],
  imports: [
    CommonModule,
    NzIconModule,
    NzSelectModule,
    NzTagModule,
    FormsModule,
    NzTypographyModule,
  ],
  exports: [ImageTagSelectComponent],
})
export class ImageTagSelectModule {}
