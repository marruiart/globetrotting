import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Redux
import { StoreModule, provideStore } from '@ngrx/store';
import { AUTH_FEATURE_KEY, authReducer } from 'src/app/core/libs/auth/auth.reducer';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { AuthEffects } from 'src/app/core/libs/auth/auth.effects';
import { EffectsModule } from '@ngrx/effects';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(AUTH_FEATURE_KEY, authReducer),
    EffectsModule.forFeature([AuthEffects]),
  ],
  providers: [
    AuthFacade
  ]
})
export class AuthModule { }
