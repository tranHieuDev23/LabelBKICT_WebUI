import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyImagesRoutingModule } from './my-images-routing.module';
import { MyImagesComponent } from './my-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AddableTagListModule } from 'src/app/components/addable-tag-list/addable-tag-list.module';
import { AddImageTagsModalComponent } from './add-image-tags-modal/add-image-tags-modal.component';
import { UserSearchBoxModule } from 'src/app/components/user-search-box/user-search-box.module';
import { NzListModule } from 'ng-zorro-antd/list';
import { FormsModule } from '@angular/forms';
import { AddManageableUsersModalComponent } from './add-manageable-users-modal/add-manageable-users-modal.component';
import { AddVerifiableUsersModalComponent } from './add-verifiable-users-modal/add-verifiable-users-modal.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@NgModule({
  declarations: [
    MyImagesComponent,
    AddImageTagsModalComponent,
    AddManageableUsersModalComponent,
    AddVerifiableUsersModalComponent,
  ],
  imports: [
    CommonModule,
    MyImagesRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    ImageFilterOptionsSelectorModule,
    ImageGridModule,
    NzDropDownModule,
    NzModalModule,
    AddableTagListModule,
    UserSearchBoxModule,
    NzListModule,
    FormsModule,
    NzCheckboxModule,
  ],
  exports: [MyImagesComponent],
})
export class MyImagesModule {}
