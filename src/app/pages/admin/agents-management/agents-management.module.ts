import { NgModule } from '@angular/core';
import { AgentsManagementPageRoutingModule } from './agents-management-routing.module';

import { AgentsManagementPage } from './agents-management.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { translateLoaderFactory } from 'src/app/core/factories/translate-loader.factory';

@NgModule({
  imports: [
    SharedModule,
    AgentsManagementPageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        deps: [HttpClient],
        useFactory: (translateLoaderFactory)
      }
    })
  ],
  declarations: [AgentsManagementPage]
})
export class AgentsManagementPageModule {}
