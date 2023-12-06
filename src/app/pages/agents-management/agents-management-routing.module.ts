import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgentsManagementPage } from './agents-management.page';

const routes: Routes = [
  {
    path: '',
    component: AgentsManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentsManagementPageRoutingModule {}
