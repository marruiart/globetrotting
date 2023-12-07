import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DestinationsManagementPage } from './destinations-management.page';

const routes: Routes = [
  {
    path: '',
    component: DestinationsManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DestinationsManagementPageRoutingModule {}
