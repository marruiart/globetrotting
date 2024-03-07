import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as BookingsActions from './bookings.actions'
import * as BookingsSelector from './bookings.selectors'
import { Booking, NewBooking } from "../../models/globetrotting/booking.interface";
import { Role } from "../../utilities/utilities";

@Injectable()
export class BookingsFacade {

    private readonly store = inject(Store);
    bookingTable$ = this.store.pipe(select(BookingsSelector.selectBookingsTable));
    error$ = this.store.pipe(select(BookingsSelector.selectError));

    initBookings() {
        this.store.dispatch(BookingsActions.initBookings());
    }

    retrieveBookingsInfo(bookings: Booking[], role: Role) {
        this.store.dispatch(BookingsActions.retrieveBookingsInfo({ bookings, role }));
    }

    saveBookingsTable(bookings: Booking[], role: Role) {
        if (bookings) {
            this.store.dispatch(BookingsActions.saveBookingsTable({ bookings, role }));
        } else {
            this.store.dispatch(BookingsActions.saveBookingsTableFailure({ error: 'Error: Management Table is empty.' }));
        }
    }

    addBooking(newBooking: NewBooking) {
        this.store.dispatch(BookingsActions.addBooking({ newBooking }));
    }

    updateBooking(booking: Booking) {
        this.store.dispatch(BookingsActions.updateBooking({ booking }));
    }

    deleteBooking(id: string | number) {
        this.store.dispatch(BookingsActions.deleteBooking({ id }));
    }

    logout() {
        this.store.dispatch(BookingsActions.logout());
    }
}