import { createAction, props } from '@ngrx/store';
import { Destination, NewDestination, PaginatedDestination, TableRow } from '../../models/globetrotting/destination.interface';

export const savePage = createAction('[Destinations API] Save Page', props<{ destinationsPage: PaginatedDestination }>());
export const saveDestinations = createAction('[Destinations API] Save Destinations', props<{ destinations: Destination[] }>());
export const saveManagementTable = createAction('[Destinations API] Save Management Table', props<{ managementTable: TableRow[] }>());

export const addDestination = createAction('[Destinations API] Add Destination', props<{ newDestination: NewDestination }>());
export const addDestinationSuccess = createAction('[Destinations API] Add Destination Success', props<{ destination: Destination }>());
export const addDestinationFailure = createAction('[Destinations API] Add Destination Failure', props<{ error: any }>());

export const updateDestination = createAction('[Destinations API] Update Destination', props<{ destination: Destination }>());
export const updateDestinationSuccess = createAction('[Destinations API] Update Destination Success', props<{ destination: Destination }>());
export const updateDestinationFailure = createAction('[Destinations API] Update Destination Failure', props<{ error: any }>());

export const deleteDestination = createAction('[Destinations API] Delete Destination', props<{ id: number | string }>());
export const deleteDestinationSuccess = createAction('[Destinations API] Delete Destination Success', props<{ id: number | string }>());
export const deleteDestinationFailure = createAction('[Destinations API] Delete Destination Failure', props<{ error: any }>());