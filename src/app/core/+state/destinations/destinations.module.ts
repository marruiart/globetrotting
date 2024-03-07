import { NgModule } from '@angular/core';

// Redux
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DestinationsFacade } from './destinations.facade';
import { DESTINATIONS_FEATURE_KEY, destinationsReducer } from './destinations.reducer';
import { DestinationsEffects } from './destinations.effects';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(DESTINATIONS_FEATURE_KEY, destinationsReducer),
    EffectsModule.forFeature([DestinationsEffects]),
  ],
  providers: [
    DestinationsFacade
  ]
})
export class DestinationsModule { }
