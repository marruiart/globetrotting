import { NgModule } from '@angular/core';

import { DestinationsManagementPageRoutingModule } from './destinations-management-routing.module';

import { DestinationsManagementPage } from './destinations-management.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    DestinationsManagementPageRoutingModule
  ],
  declarations: [DestinationsManagementPage]
})
export class DestinationsManagementPageModule {}
