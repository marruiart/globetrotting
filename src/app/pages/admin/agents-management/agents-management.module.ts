import { NgModule } from '@angular/core';
import { AgentsManagementPageRoutingModule } from './agents-management-routing.module';

import { AgentsManagementPage } from './agents-management.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AgentsManagementPageRoutingModule
  ],
  declarations: [AgentsManagementPage]
})
export class AgentsManagementPageModule {}
