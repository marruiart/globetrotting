import { NgModule } from '@angular/core';

import { AdminPageRoutingModule } from './admin-routing.module';

import { AdminPage } from './admin.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AdminPageRoutingModule
  ],
  declarations: [
    AdminPage
  ]
})
export class AdminPageModule { }
