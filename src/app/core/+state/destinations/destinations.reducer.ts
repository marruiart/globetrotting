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
    on(DestinationsActions.addDestinationSuccess, (state, { destination }) => ({ ...state, destinations: [...state.destinations, destination], error: null })),
    on(DestinationsActions.addDestinationFailure, (state, { error }) => ({ ...state, error: error })),
    on(DestinationsActions.updateDestinationSuccess, (state, { destination }) => ({ ...state, destinations: updateDestination(state, destination), error: null })),
    on(DestinationsActions.updateDestinationFailure, (state, { error }) => ({ ...state, error: error })),
    on(DestinationsActions.deleteDestinationSuccess, (state, { id }) => ({ ...state, destinations: state.destinations.filter(d => d.id != id), error: null })),
    on(DestinationsActions.deleteDestinationFailure, (state, { error }) => ({ ...state, error: error })),
);

function updateDestination(state: DestinationsState, destination: Destination) {
    return state.destinations.map(d => (d.id == destination.id) ? destination : d);
}