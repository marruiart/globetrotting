import { createAction, props } from '@ngrx/store';
import { ExtUser } from '../../models/globetrotting/user.interface';
import { AuthUser } from '../../models/globetrotting/auth.interface';
import { Client } from '../../models/globetrotting/client.interface';
import { TravelAgent } from '../../models/globetrotting/agent.interface';

export const loadUser = createAction('[Load User] Load User', props<{ user: AuthUser, redirectUrl: string }>());
export const loadExtendedUser = createAction('[Load User] Load Extended User', props<{ user_id: number }>());
export const loadSpecificUser = createAction('[Load User] Load Specific User', props<{ user_id: number, role: string }>());
export const assignExtendedUser = createAction('[Load User] Assing Extended User', props<{ extendedUser: ExtUser | null }>());
export const assignSpecificUser = createAction('[Load User] Assing Specific User', props<{ specificUser: Client | TravelAgent | null }>());
export const updateSpecificUser = createAction('[Load User] Update Specific User', props<{ specificUser: Client | TravelAgent | null }>());
export const assignNickname = createAction('[Load User] Assing Nickname', props<{ nickname: string }>());
export const loadUserSuccess = createAction('[Load User] Load User Success');
export const loadUserFailure = createAction('[Load User] Load User Failure', props<{ error: any }>());