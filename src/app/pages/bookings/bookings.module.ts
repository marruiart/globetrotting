import { NgModule } from '@angular/core';

import { BookingsPageRoutingModule } from './bookings-routing.module';

import { BookingsPage } from './bookings.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { translateLoaderFactory } from 'src/app/core/factories/translate-loader.factory';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    BookingsPageRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        deps: [HttpClient],
        useFactory: (translateLoaderFactory)
      }
    })
  ],
  declarations: [BookingsPage]
})
export class BookingsPageModule {



}
