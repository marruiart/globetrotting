import { NgModule } from '@angular/core';
import { DestinationsPage } from './destinations.page';

import { DestinationsPageRoutingModule } from './destinations-routing.module';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    DestinationsPageRoutingModule,
    PrimengModule,
    SharedModule
  ],
  declarations: [
    DestinationsPage
  ]
})
export class DestinationsPageModule { }
