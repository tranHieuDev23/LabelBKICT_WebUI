import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorBoxComponent } from './color-box.component';
import { ColorTwitterModule } from 'ngx-color/twitter';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';



@NgModule({
  declarations: [ColorBoxComponent],
  imports: [
    CommonModule,
    ColorTwitterModule,
    NzButtonModule,
    NzIconModule,
    NzPopoverModule
  ],
  exports: [
    ColorBoxComponent
  ]
})
export class ColorBoxModule { }
