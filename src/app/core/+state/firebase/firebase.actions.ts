import { createAction, props } from '@ngrx/store';
import { Sizes } from './firebase.reducer';
import { FirebaseDocument } from '../../models/firebase-interfaces/firebase-data.interface';

export const initSizes = createAction('[Firebase API] Init', props<{ docs: FirebaseDocument[] }>());
export const initSizesSuccess = createAction('[Firebase API] Init Sizes Success', props<{ sizes: Sizes }>());
export const initSizesFailure = createAction('[Firebase API] Init Sizes Failure', props<{ error: any }>());
export const updateSizes = createAction('[Firebase API] Update Sizes', props<{ collection: string }>());
export const updateSizesSuccess = createAction('[Firebase API] Update Sizes Success', props<{ collection: string }>());
export const updateSizesFailure = createAction('[Firebase API] Update Sizes Failure', props<{ error: any }>());