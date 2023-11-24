import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MouseTooltipComponent } from './mouse-tooltip.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzElementPatchModule } from 'ng-zorro-antd/core/element-patch';

@NgModule({
  declarations: [MouseTooltipComponent],
  imports: [CommonModule, NzToolTipModule, NzElementPatchModule],
  exports: [MouseTooltipComponent],
})
export class MouseTooltipModule {}
