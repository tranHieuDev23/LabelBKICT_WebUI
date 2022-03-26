import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableTagListComponent } from './editable-tag-list.component';
import { FormsModule } from '@angular/forms';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';



@NgModule({
  declarations: [EditableTagListComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzTagModule,
    NzSelectModule,
    NzTypographyModule,
    NzIconModule
  ],
  exports: [
    EditableTagListComponent
  ]
})
export class EditableTagListModule { }
