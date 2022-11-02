import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableTextComponent } from './editable-text.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FocusableDirective } from './focusable.directive';

@NgModule({
  declarations: [EditableTextComponent, FocusableDirective],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    ReactiveFormsModule,
  ],
  exports: [EditableTextComponent],
})
export class EditableTextModule {}
