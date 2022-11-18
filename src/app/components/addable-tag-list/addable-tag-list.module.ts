import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddableTagListComponent } from './addable-tag-list.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ImageTagSelectModule } from '../image-tag-select/image-tag-select.module';

@NgModule({
  declarations: [AddableTagListComponent],
  imports: [CommonModule, NzTagModule, ImageTagSelectModule],
  exports: [AddableTagListComponent],
})
export class AddableTagListModule {}
