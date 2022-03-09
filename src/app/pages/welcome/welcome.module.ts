import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from './welcome.component';
import { WelcomeRoutingModule } from './welcome-routing.module';
import { NzGridModule } from 'ng-zorro-antd/grid';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [CommonModule, WelcomeRoutingModule, NzGridModule],
  exports: [WelcomeComponent],
})
export class WelcomeModule {}
