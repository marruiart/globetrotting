import { createAction, props } from '@ngrx/store';
import { UserCredentials, UserRegisterInfo } from '../../models/globetrotting/user.interface';
import { Auth, AuthUser } from '../../models/globetrotting/auth.interface';

export const init = createAction('[Auth API] Init');
export const login = createAction('[Auth API] Login', props<{ credentials: UserCredentials }>());
export const loginSuccess = createAction('[Auth API] Login Success');
export const loginFailure = createAction('[Auth API] Login Failure', props<{ error: any }>());
export const assignRole = createAction('[Auth API] Assign Role', props<{ user: AuthUser }>());
export const logout = createAction('[Auth API] Logout');
export const logoutSuccess = createAction('[Auth API] Logout Success');
export const logoutFailure = createAction('[Auth API] Logout Failure', props<{ error: any }>());
export const register = createAction('[Auth API] Register', props<{ registerInfo: UserRegisterInfo }>());
export const registerSuccess = createAction('[Auth API] Register Success');
export const registerFailure = createAction('[Auth API] Register Failure', props<{ error: any }>());