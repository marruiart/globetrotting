import { createAction, props } from '@ngrx/store';
import { CurrentUserData } from '../../models/globetrotting/user.interface';
import { AuthUser } from '../../models/globetrotting/auth.interface';

export const initAssignUserData = createAction('[User] Init Assign User Data', props<{ user: AuthUser }>());
export const assignUserData = createAction('[User] Assign User Data', props<{ data: CurrentUserData }>());
export const assignUserDataSuccess = createAction('[User] Assign User Data Success');
export const assignUserDataFailure = createAction('[User] Assign User Data Failure', props<{ error: any }>());