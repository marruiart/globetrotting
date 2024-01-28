import { createAction, props } from '@ngrx/store';
import { UserCredentials, UserRegisterInfo } from '../../models/globetrotting/user.interface';
import { AuthUser, AuthUserOptions } from '../../models/globetrotting/auth.interface';
import { StrapiAuthUser } from '../../models/strapi-interfaces/strapi-user.interface';

export const init = createAction('[Auth API] Init');
export const login = createAction('[Auth API] Login', props<{ credentials: UserCredentials }>());
export const loginSuccess = createAction('[Auth API] Login Success');
export const loginFailure = createAction('[Auth API] Login Failure', props<{ error: any }>());
export const assignUid = createAction('[Auth API] Assign UID', props<{ uid: string | null }>());
export const assignRole = createAction('[Auth API] Assign Role Success');
export const assignRoleSuccess = createAction('[Auth API] Assign Role', props<{ user: AuthUserOptions }>());
export const assignRoleFailure = createAction('[Auth API] Assign Role Failure', props<{ error: any }>());
export const logout = createAction('[Auth API] Logout');
export const logoutSuccess = createAction('[Auth API] Logout Success');
export const logoutFailure = createAction('[Auth API] Logout Failure', props<{ error: any }>());
export const register = createAction('[Auth API] Register', props<{ registerInfo: UserRegisterInfo }>());
export const registerSuccess = createAction('[Auth API] Register Success');
export const registerFailure = createAction('[Auth API] Register Failure', props<{ error: any }>());