import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableRichTextComponent } from './editable-rich-text.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [EditableRichTextComponent],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    ReactiveFormsModule,
    QuillModule.forRoot(),
  ],
  exports: [EditableRichTextComponent],
})
export class EditableRichTextModule {}
