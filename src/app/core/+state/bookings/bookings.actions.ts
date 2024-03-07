import { createAction, props } from '@ngrx/store';
import { Booking, BookingsTableRow, NewBooking } from '../../models/globetrotting/booking.interface';
import { Role } from '../../utilities/utilities';

export const initBookings = createAction('[Bookings API] Init Bookings');
export const initBookingsSuccess = createAction('[Bookings API] Init Bookings Success');
export const initBookingsFailure = createAction('[Bookings API] Init Bookings Failure', props<{ error: any }>());

export const retrieveBookingsInfo = createAction('[Bookings API] Retrieve Bookings Info', props<{ bookings: Booking[], role: Role }>());
export const saveBookingsTable = createAction('[Bookings API] Save Bookings', props<{ bookings: Booking[], role: Role }>());
export const saveBookingsTableSuccess = createAction('[Bookings API] Save Bookings Table Success', props<{ bookingsTable: BookingsTableRow[] }>());
export const saveBookingsTableFailure = createAction('[Bookings API] Save Bookings Table Failure', props<{ error: any }>());

export const addBooking = createAction('[Bookings API] Add Booking', props<{ newBooking: NewBooking }>());
export const addBookingSuccess = createAction('[Bookings API] Add Booking Success');
export const addBookingFailure = createAction('[Bookings API] Add Booking Failure', props<{ error: any }>());

export const updateBooking = createAction('[Bookings API] Update Booking', props<{ booking: Booking }>());
export const updateBookingSuccess = createAction('[Bookings API] Update Booking Success');
export const updateBookingFailure = createAction('[Bookings API] Update Booking Failure', props<{ error: any }>());

export const deleteBooking = createAction('[Bookings API] Delete Booking', props<{ id: number | string }>());
export const deleteBookingSuccess = createAction('[Bookings API] Delete Booking Success');
export const deleteBookingFailure = createAction('[Bookings API] Delete Booking Failure', props<{ error: any }>());

export const logout = createAction('[Bookings API] Logout');