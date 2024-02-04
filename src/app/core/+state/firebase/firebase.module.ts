import { NgModule } from '@angular/core';

// Redux
import { StoreModule } from '@ngrx/store';
import { FirebaseEffects } from 'src/app/core/+state/firebase/firebase.effects';
import { EffectsModule } from '@ngrx/effects';
import { FirebaseFacade } from './firebase.facade';
import { FIREBASE_FEATURE_KEY, firebaseReducer } from './firebase.reducer';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(FIREBASE_FEATURE_KEY, firebaseReducer),
    EffectsModule.forFeature([FirebaseEffects]),
  ],
  providers: [
    FirebaseFacade
  ]
})
export class FirebaseModule { }
