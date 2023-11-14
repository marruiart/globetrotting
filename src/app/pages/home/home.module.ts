import { NgModule } from '@angular/core';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    HomePageRoutingModule,
    PrimengModule,
    SharedModule
  ],
  declarations: [
    HomePage
  ]
})
export class HomePageModule { }
