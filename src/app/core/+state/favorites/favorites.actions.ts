import { createAction, props } from '@ngrx/store';
import { ClientFavDestination, Fav, NewFav } from '../../models/globetrotting/fav.interface';

export const init = createAction('[Favorites API] Init');
export const assignClientFavs = createAction('[Favorites API] ClientFavs', props<{ clientFavs: ClientFavDestination[] }>());
export const assignClientFavsSuccess = createAction('[Favorites API] ClientFavs Success', props<{ clientFavs: ClientFavDestination[] }>());
export const assignClientFavsFailure = createAction('[Favorites API] ClientFavs Failure', props<{ error: any }>());
export const addFav = createAction('[Favorites API] Add Favorite', props<{ newFav: NewFav }>());
export const addFavSuccess = createAction('[Favorites API] Add Favorite Success');
export const addFavFailure = createAction('[Favorites API] Add Favorite Failure', props<{ error: any }>());
export const deleteFav = createAction('[Favorites API] Delete Favorite', props<{ id: number | string }>());
export const deleteFavSuccess = createAction('[Favorites API] Delete Favorite Success');
export const deleteFavFailure = createAction('[Favorites API] Delete Favorite Failure', props<{ error: any }>());