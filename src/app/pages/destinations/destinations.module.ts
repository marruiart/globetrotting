import { NgModule } from '@angular/core';
import { DestinationsPage } from './destinations.page';

import { DestinationsPageRoutingModule } from './destinations-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    DestinationsPageRoutingModule,
    SharedModule
  ],
  declarations: [
    DestinationsPage
  ]
})
export class DestinationsPageModule { }
