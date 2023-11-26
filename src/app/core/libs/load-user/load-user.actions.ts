import { createAction, props } from '@ngrx/store';
import { CurrentUser } from '../../models/globetrotting/user.interface';
import { AuthUser } from '../../models/globetrotting/auth.interface';

export const loadUser = createAction('[Load User] Load User', props<{ user: AuthUser }>());
export const assignExtendedUser = createAction('[Load User] Assing Extended User', props<{ user: CurrentUser }>());
export const assignSpecificUser = createAction('[Load User] Assing Specific User', props<{ user: CurrentUser }>());
export const loadUserSuccess = createAction('[Load User] Load User Success');
export const loadUserFailure = createAction('[Load User] Load User Failure', props<{ error: any }>());