import { createAction, props } from '@ngrx/store';
import { AdminAgentOrClientUser, UserCredentials, UserRegisterInfo } from '../../models/globetrotting/user.interface';
import { Role } from '../../utilities/utilities';

export const init = createAction('[Auth API] Init');

export const login = createAction('[Auth API] Login', props<{ credentials: UserCredentials }>());
export const loginSuccess = createAction('[Auth API] Login Success');
export const loginFailure = createAction('[Auth API] Login Failure', props<{ error: any }>());

export const navigate = createAction('[Auth API] Navigate', props<{ role: Role | number }>());
export const navigateSuccess = createAction('[Auth API] Navigate Success');

export const me = createAction('[Auth API] Me');
export const updateUser = createAction('[Auth API] Update User', props<{ user: AdminAgentOrClientUser }>());
export const assignUserSuccess = createAction('[Auth API] Assign User Success', props<{ user: AdminAgentOrClientUser }>());
export const assignUserFailure = createAction('[Auth API] Assign User Failure', props<{ error: any }>());


export const logout = createAction('[Auth API] Logout');
export const logoutSuccess = createAction('[Auth API] Logout Success');
export const logoutFailure = createAction('[Auth API] Logout Failure', props<{ error: any }>());

export const register = createAction('[Auth API] Register', props<{ registerInfo: UserRegisterInfo, isAgent: boolean }>());
export const registerSuccess = createAction('[Auth API] Register Success');
export const registerFailure = createAction('[Auth API] Register Failure', props<{ error: any }>());