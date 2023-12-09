import { NgModule } from '@angular/core';

import { DestinationsManagementPageRoutingModule } from './destinations-management-routing.module';

import { DestinationsManagementPage } from './destinations-management.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { translateLoaderFactory } from 'src/app/core/factories/translate-loader.factory';

@NgModule({
  imports: [
    SharedModule,
    DestinationsManagementPageRoutingModule
  ],
  declarations: [DestinationsManagementPage]
})
export class DestinationsManagementPageModule {}
