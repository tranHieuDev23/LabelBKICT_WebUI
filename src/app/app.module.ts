import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { EmptyStringOnMobileModule } from './pipes/empty-string-on-mobile/empty-string-on-mobile.module';
import { Axios } from 'axios';
import { getAxiosInstance } from './services/dataaccess/api/axios';
import { UserLoggedInGuard } from './services/utils/route-guards/logged-in-guard';
import { UserLoggedOutGuard } from './services/utils/route-guards/logged-out-guard';
import { DragToSelectModule } from 'ngx-drag-to-select';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { IconDefinition } from '@ant-design/icons-angular';
import {
  UserOutline,
  SettingOutline,
  DeleteOutline,
  PushpinOutline,
  HighlightOutline,
  PlusOutline,
  EditOutline,
  CloseOutline,
  CheckOutline,
  InboxOutline,
  ZoomInOutline,
  ZoomOutOutline,
  UndoOutline,
  RedoOutline,
  ExportOutline,
  FileExcelOutline,
  ReloadOutline,
  MinusCircleOutline,
  PlusCircleOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  LeftOutline,
  RightOutline,
  UserAddOutline,
  LockOutline,
  InfoCircleOutline,
  PictureOutline,
  TagOutline,
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);

const icons: IconDefinition[] = [
  UserOutline,
  SettingOutline,
  DeleteOutline,
  PushpinOutline,
  HighlightOutline,
  PlusOutline,
  EditOutline,
  CloseOutline,
  CheckOutline,
  InboxOutline,
  ZoomInOutline,
  ZoomOutOutline,
  UndoOutline,
  RedoOutline,
  ExportOutline,
  FileExcelOutline,
  ReloadOutline,
  MinusCircleOutline,
  PlusCircleOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  LeftOutline,
  RightOutline,
  UserAddOutline,
  LockOutline,
  InfoCircleOutline,
  PictureOutline,
  TagOutline,
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzIconModule.forRoot(icons),
    NzLayoutModule,
    NzMenuModule,
    NzBackTopModule,
    EmptyStringOnMobileModule,
    DragToSelectModule.forRoot(),
    NzPopoverModule,
    NzInputModule,
    FormsModule,
    NzButtonModule,
    NzNotificationModule,
  ],
  providers: [
    UserLoggedInGuard,
    UserLoggedOutGuard,
    { provide: NZ_I18N, useValue: en_US },
    { provide: Axios, useFactory: getAxiosInstance },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
