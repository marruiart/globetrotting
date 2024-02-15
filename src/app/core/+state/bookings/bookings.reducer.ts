import { createReducer, on } from '@ngrx/store';
import * as BookingsActions from './bookings.actions';
import { BookingsTableRow } from '../../models/globetrotting/booking.interface';

export const BOOKINGS_FEATURE_KEY = 'bookings'

export type BookingsState = {
    bookingsTable: BookingsTableRow[],
    error: any | null
}

export const initialState: BookingsState = {
    bookingsTable: [],
    error: null
};

export const bookingsReducer = createReducer(
    initialState,
    on(BookingsActions.saveBookingsTable, (state, { bookings }) => ({ ...state, bookings })),
    on(BookingsActions.saveBookingsTableSuccess, (state, { bookingsTable }) => ({ ...state, bookingsTable: bookingsTable, error: null })),
    on(BookingsActions.addBookingSuccess, (state) => ({ ...state, error: null })),
    on(BookingsActions.addBookingFailure, (state, { error }) => ({ ...state, error: error })),
    on(BookingsActions.updateBookingSuccess, (state) => ({ ...state, error: null })),
    on(BookingsActions.updateBookingFailure, (state, { error }) => ({ ...state, error: error })),
    on(BookingsActions.deleteBookingSuccess, (state) => ({ ...state, error: null })),
    on(BookingsActions.deleteBookingFailure, (state, { error }) => ({ ...state, error: error })),
);
