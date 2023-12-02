import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllImagesRoutingModule } from './all-images-routing.module';
import { AllImagesComponent } from './all-images.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AddableTagListModule } from 'src/app/components/addable-tag-list/addable-tag-list.module';
import { AddImageTagsModalComponent } from './add-image-tags-modal/add-image-tags-modal.component';
import { AddManageableUsersModalComponent } from './add-manageable-users-modal/add-manageable-users-modal.component';
import { AddVerifiableUsersModalComponent } from './add-verifiable-users-modal/add-verifiable-users-modal.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UserSearchBoxModule } from 'src/app/components/user-search-box/user-search-box.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AllImagesComponent,
    AddImageTagsModalComponent,
    AddManageableUsersModalComponent,
    AddVerifiableUsersModalComponent,
  ],
  imports: [
    CommonModule,
    AllImagesRoutingModule,
    NzTypographyModule,
    NzPaginationModule,
    ImageFilterOptionsSelectorModule,
    ImageGridModule,
    NzDropDownModule,
    NzModalModule,
    AddableTagListModule,
    UserSearchBoxModule,
    NzListModule,
    NzCheckboxModule,
    FormsModule,
  ],
  exports: [AllImagesComponent],
})
export class AllImagesModule {}
