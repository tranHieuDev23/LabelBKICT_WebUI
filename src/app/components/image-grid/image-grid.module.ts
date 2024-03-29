import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGridComponent } from './image-grid.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { DragToSelectModule } from 'ngx-drag-to-select';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [ImageGridComponent],
  imports: [
    CommonModule,
    NzButtonModule,
    NzGridModule,
    NzTypographyModule,
    NzCardModule,
    NzTagModule,
    NzSkeletonModule,
    NzEmptyModule,
    DragToSelectModule,
    NzIconModule,
  ],
  exports: [ImageGridComponent],
})
export class ImageGridModule {}
