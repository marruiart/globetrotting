import { NgModule } from '@angular/core';

// Redux
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { USER_FEATURE_KEY, userReducer } from './load-user.reducer';
import { UserEffects } from './load-user.effects';
import { UserFacade } from './load-user.facade';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(USER_FEATURE_KEY, userReducer),
    EffectsModule.forFeature([UserEffects]),
  ],
  providers: [
    UserFacade
  ]
})
export class UserModule { }
