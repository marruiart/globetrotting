import { NgModule } from '@angular/core';

// Redux
import { StoreModule } from '@ngrx/store';
import { ClientsEffects } from 'src/app/core/+state/clients/clients.effects';
import { EffectsModule } from '@ngrx/effects';
import { ClientsFacade } from './clients.facade';
import { CLIENTS_FEATURE_KEY, clientsReducer } from './clients.reducer';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(CLIENTS_FEATURE_KEY, clientsReducer),
    EffectsModule.forFeature([ClientsEffects]),
  ],
  providers: [
    ClientsFacade
  ]
})
export class ClientsModule { }
