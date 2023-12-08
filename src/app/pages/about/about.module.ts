import { NgModule } from '@angular/core';

import { AboutPageRoutingModule } from './about-routing.module';

import { AboutPage } from './about.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { translateLoaderFactory } from 'src/app/core/factories/translate-loader.factory';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    SharedModule,
    AboutPageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        deps: [HttpClient],
        useFactory: (translateLoaderFactory)
      }
    })
  ],
  declarations: [AboutPage]
})
export class AboutPageModule {}
