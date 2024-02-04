import { createAction, props } from '@ngrx/store';
import { Sizes } from './firebase.reducer';

export const init = createAction('[Firebase API] Init');
export const initSizes = createAction('[Firebase API] Init Sizes');
export const initSizesSuccess = createAction('[Firebase API] Init Sizes Success', props<{ sizes: Sizes }>());
export const initSizesFailure = createAction('[Firebase API] Init Sizes Failure', props<{ error: any }>());
export const updateSizes = createAction('[Firebase API] Update Sizes', props<{ collection: string }>());
export const updateSizesSuccess = createAction('[Firebase API] Update Sizes Success', props<{ collection: string }>());
export const updateSizesFailure = createAction('[Firebase API] Update Sizes Failure', props<{ error: any }>());