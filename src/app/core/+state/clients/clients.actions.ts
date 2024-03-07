import { createAction, props } from '@ngrx/store';
import { User } from '../../models/globetrotting/user.interface';

export const saveClientUsers = createAction('[Clients API] Save Clients', props<{ clients: User[] }>());
export const saveClientUsersSuccess = createAction('[Clients API] Save Clients Success', props<{ clients: User[] }>());
export const saveClientUsersFailure = createAction('[Clients API] Save Clients Failure', props<{ error: any }>());

export const logout = createAction('[Clients API] Logout');