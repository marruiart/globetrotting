import { createAction, props } from '@ngrx/store';
import { UserCredentials, UserRegisterInfo } from '../../models/globetrotting/user.interface';
import { Auth, AuthUser } from '../../models/globetrotting/auth.interface';

export const login = createAction('[Auth API] Login', props<{ credentials: UserCredentials }>());
export const loginSuccess = createAction('[Auth API] Login Success');
export const assignRole = createAction('[Auth API] Assign Role', props<{ user: AuthUser }>());
export const redirectRole = createAction('[Auth API] Redirect Role', props<{ redirectUrl: string }>());
export const loginFailure = createAction('[Auth API] Login Failure', props<{ error: any }>());
export const logout = createAction('[Auth API] Logout');
export const register = createAction('[Auth API] Register', props<{ registerInfo: UserRegisterInfo }>());
export const registerSuccess = createAction('[Auth API] Register Success', props<{ auth: Auth }>());