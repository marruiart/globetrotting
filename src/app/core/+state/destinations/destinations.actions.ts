import { createAction, props } from '@ngrx/store';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';

export const init = createAction('[Destinations API] Init', props<{ destinations: Destination[] }>());
export const initSuccess = createAction('[Destinations API] Init Success', props<{ destinations: Destination[] }>());
export const initFailure = createAction('[Destinations API] Init Failure', props<{ error: any }>());
export const savePage = createAction('[Destinations API] Save Page', props<{ destinationsPage: PaginatedDestination }>());
export const savePageSuccess = createAction('[Destinations API] Save Page Success', props<{ destinationsPage: PaginatedDestination }>());
export const savePageFailure = createAction('[Destinations API] Save Page Failure', props<{ error: any }>());
export const addDestination = createAction('[Destinations API] Add Destination', props<{ newDestination: NewDestination }>());
export const addDestinationSuccess = createAction('[Destinations API] Add Destination Success');
export const addDestinationFailure = createAction('[Destinations API] Add Destination Failure', props<{ error: any }>());
export const deleteDestination = createAction('[Destinations API] Delete Destination', props<{ id: number | string }>());
export const deleteDestinationSuccess = createAction('[Destinations API] Delete Destination Success');
export const deleteDestinationFailure = createAction('[Destinations API] Delete Destination Failure', props<{ error: any }>());