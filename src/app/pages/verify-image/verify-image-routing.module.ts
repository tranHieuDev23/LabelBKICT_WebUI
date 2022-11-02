import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerifyImageComponent } from './verify-image.component';

const routes: Routes = [{ path: ':id', component: VerifyImageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyImageRoutingModule {}
