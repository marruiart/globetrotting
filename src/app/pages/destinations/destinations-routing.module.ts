import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DestinationsPage } from './destinations.page';

const routes: Routes = [
  {
    path: '',
    component: DestinationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DestinationsPageRoutingModule {}
