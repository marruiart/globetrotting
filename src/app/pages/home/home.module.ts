import { NgModule } from '@angular/core';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { translateLoaderFactory } from 'src/app/core/factories/translate-loader.factory';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports: [
    SharedModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage
  ]
})
export class HomePageModule { }
