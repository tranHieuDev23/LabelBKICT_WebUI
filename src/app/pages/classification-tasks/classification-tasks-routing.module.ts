import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassificationTasksComponent } from './classification-tasks.component';

const routes: Routes = [{ path: '', component: ClassificationTasksComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassificationTasksRoutingModule {}
