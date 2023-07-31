import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetectionTasksComponent } from './detection-tasks.component';

const routes: Routes = [{ path: '', component: DetectionTasksComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetectionTasksRoutingModule {}
