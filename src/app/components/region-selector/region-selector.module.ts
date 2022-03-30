import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionSelectorComponent } from './region-selector.component';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [RegionSelectorComponent],
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule],
  exports: [RegionSelectorComponent],
})
export class RegionSelectorModule {}
