import { createReducer, on } from '@ngrx/store';
import * as DestinationsActions from './destinations.actions';
import { Destination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data.interface';

export const DESTINATIONS_FEATURE_KEY = 'destinations'

export type DestinationsState = {
    destinationsPage: PaginatedDestination,
    destinations: Destination[],
    error: any | null
}

export const initialState: DestinationsState = {
    destinationsPage: emptyPaginatedData,
    destinations: [],
    error: null
};

export const destinationsReducer = createReducer(
    initialState,
    on(DestinationsActions.initSuccess, (state, { destinations }) => ({ ...state, destinations: destinations, error: null })),
    on(DestinationsActions.savePageSuccess, (state, { destinationsPage }) => ({ ...state, destinationsPage: destinationsPage, destinations: getNewDestinations(state, destinationsPage), error: null })),
    on(DestinationsActions.savePageFailure, (state, { error }) => ({ ...state, error: error })),
    on(DestinationsActions.addDestinationSuccess, (state) => ({ ...state, error: null })),
    on(DestinationsActions.addDestinationFailure, (state, { error }) => ({ ...state, error: error })),
    on(DestinationsActions.deleteDestinationSuccess, (state) => ({ ...state, error: null })),
    on(DestinationsActions.deleteDestinationFailure, (state, { error }) => ({ ...state, error: error })),
);

function getNewDestinations(state: DestinationsState, destinationsPage: PaginatedDestination): Destination[] {
    let _newDestinations: Destination[] = JSON.parse(JSON.stringify(state.destinations));
    destinationsPage.data.forEach(destData => {
        let foundDest: Destination | undefined = state.destinations.find(dest => dest.name == destData.name);
        if (!foundDest) {
            _newDestinations.push(destData);
        }
    })
    return _newDestinations;
}