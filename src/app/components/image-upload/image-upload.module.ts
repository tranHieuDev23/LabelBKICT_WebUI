import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from './image-upload.component';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { EditableTagListModule } from '../editable-tag-list/editable-tag-list.module';

@NgModule({
  declarations: [ImageUploadComponent],
  imports: [
    CommonModule,
    NzButtonModule,
    NzUploadModule,
    NzIconModule,
    NzCheckboxModule,
    NzSelectModule,
    NzInputModule,
    FormsModule,
    EditableTagListModule,
  ],
  exports: [ImageUploadComponent],
})
export class ImageUploadModule {}
