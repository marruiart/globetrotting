import { createAction, props } from '@ngrx/store';
import { User, UserCredentials, UserRegisterInfo } from '../../models/globetrotting/user.interface';

export const init = createAction('[Auth API] Init');
export const login = createAction('[Auth API] Login', props<{ credentials: UserCredentials }>());
export const loginSuccess = createAction('[Auth API] Login Success');
export const loginFailure = createAction('[Auth API] Login Failure', props<{ error: any }>());
export const assignUid = createAction('[Auth API] Assign UID', props<{ user_id: string | null }>());
export const assignUser = createAction('[Auth API] Assign User');
export const assignUserSuccess = createAction('[Auth API] Assign User Success', props<{ user: User }>());
export const assignUserFailure = createAction('[Auth API] Assign User Failure', props<{ error: any }>());
export const updateUser = createAction('[Auth API] Update User', props<{ user: User }>());
export const logout = createAction('[Auth API] Logout');
export const logoutSuccess = createAction('[Auth API] Logout Success');
export const logoutFailure = createAction('[Auth API] Logout Failure', props<{ error: any }>());
export const register = createAction('[Auth API] Register', props<{ registerInfo: UserRegisterInfo }>());
export const registerSuccess = createAction('[Auth API] Register Success');
export const registerFailure = createAction('[Auth API] Register Failure', props<{ error: any }>());