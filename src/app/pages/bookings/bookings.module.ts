import { NgModule } from '@angular/core';

import { BookingsPageRoutingModule } from './bookings-routing.module';

import { BookingsPage } from './bookings.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    BookingsPageRoutingModule,
    SharedModule
  ],
  declarations: [BookingsPage]
})
export class BookingsPageModule { }
