import { createReducer, on } from '@ngrx/store';
import * as DestinationsActions from './destinations.actions';
import { Destination, PaginatedDestination, TableRow } from '../../models/globetrotting/destination.interface';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data.interface';

export const DESTINATIONS_FEATURE_KEY = 'destinations'

export type DestinationsState = {
    managementTable: TableRow[],
    destinationsPage: PaginatedDestination,
    destinations: Destination[],
    error: any | null
}

export const initialState: DestinationsState = {
    managementTable: [],
    destinationsPage: emptyPaginatedData,
    destinations: [],
    error: null
};

export const destinationsReducer = createReducer(
    initialState,
    on(DestinationsActions.savePage, (state, { destinationsPage }) => ({ ...state, destinationsPage: destinationsPage, error: null })),
    on(DestinationsActions.saveDestinations, (state, { destinations }) => ({ ...state, destinations: destinations, error: null })),
    on(DestinationsActions.saveManagementTable, (state, { managementTable }) => ({ ...state, managementTable: managementTable, error: null })),
    on(DestinationsActions.addDestinationSuccess, (state) => ({ ...state, error: null })),
    on(DestinationsActions.addDestinationFailure, (state, { error }) => ({ ...state, error: error })),
    on(DestinationsActions.updateDestinationSuccess, (state) => ({ ...state, error: null })),
    on(DestinationsActions.updateDestinationFailure, (state, { error }) => ({ ...state, error: error })),
    on(DestinationsActions.deleteDestinationSuccess, (state) => ({ ...state, error: null })),
    on(DestinationsActions.deleteDestinationFailure, (state, { error }) => ({ ...state, error: error })),
);