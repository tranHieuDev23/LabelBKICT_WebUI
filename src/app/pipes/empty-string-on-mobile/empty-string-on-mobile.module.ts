import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStringOnMobilePipe } from './empty-string-on-mobile.pipe';



@NgModule({
  declarations: [
    EmptyStringOnMobilePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EmptyStringOnMobilePipe
  ]
})
export class EmptyStringOnMobileModule { }
