import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadImagesRoutingModule } from './upload-images-routing.module';
import { UploadImagesComponent } from './upload-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ImageUploadModule } from 'src/app/components/image-upload/image-upload.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

@NgModule({
  declarations: [UploadImagesComponent],
  imports: [
    CommonModule,
    UploadImagesRoutingModule,
    NzTypographyModule,
    ImageUploadModule,
    NzNotificationModule,
    NzGridModule,
    NzIconModule,
  ],
  exports: [UploadImagesComponent],
})
export class UploadImagesModule {}
