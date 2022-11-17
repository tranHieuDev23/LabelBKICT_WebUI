import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableTagListComponent } from './editable-tag-list.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ImageTagSelectModule } from '../image-tag-select/image-tag-select.module';

@NgModule({
  declarations: [EditableTagListComponent],
  imports: [CommonModule, NzTagModule, ImageTagSelectModule],
  exports: [EditableTagListComponent],
})
export class EditableTagListModule {}
