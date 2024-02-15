import { NgModule } from '@angular/core';

// Redux
import { StoreModule } from '@ngrx/store';
import { BOOKINGS_FEATURE_KEY, bookingsReducer } from 'src/app/core/+state/bookings/bookings.reducer';
import { BookingsFacade } from 'src/app/core/+state/bookings/bookings.facade';
import { BookingsEffects } from 'src/app/core/+state/bookings/bookings.effects';
import { EffectsModule } from '@ngrx/effects';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(BOOKINGS_FEATURE_KEY, bookingsReducer),
    EffectsModule.forFeature([BookingsEffects]),
  ],
  providers: [
    BookingsFacade
  ]
})
export class BookingsModule { }
