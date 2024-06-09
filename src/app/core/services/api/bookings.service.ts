import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Booking, NewBooking } from '../../models/globetrotting/booking.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { AdminAgentOrClientUser } from '../../models/globetrotting/user.interface';
import { AuthFacade } from '../../+state/auth/auth.facade';
import { BookingsFacade } from '../../+state/bookings/bookings.facade';
import { StrapiEndpoints } from '../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class BookingsService extends ApiService {
  protected authFacade = inject(AuthFacade);
  protected bookingsFacade = inject(BookingsFacade);
  private queries: { [query: string]: string } = {
    "populate": "destination.name,client.user,agent.user",
    "sort": "destination.name"
  }

  protected currentUser: AdminAgentOrClientUser | null = null;

  constructor(
    protected dataSvc: DataService,
    protected mappingSvc: MappingService
  ) {
    super();
    this.authFacade.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      } else {
        this.bookingsFacade.logout();
      }
    })
  }

  /**
 * Retrieves all bookings for the current user.
 * If the user is an admin, retrieves all bookings.
 * If the user is an agent, retrieves bookings filtered by the agent's specific ID.
 * If the user is authenticated (client), retrieves bookings filtered by the client's specific ID.
 *
 * @returns {Observable<Booking[]>} An observable of the array of bookings.
 */
  public getAllBookings(): Observable<Booking[]> {
    if (this.currentUser) {
      let _queries = { ...this.queries };
      switch (this.currentUser.role) {
        case 'ADMIN':
          break;
        case 'AGENT':
          _queries["filters[agent]"] = `${this.currentUser.specific_id}`;
          break;
        case 'AUTHENTICATED':
          _queries["filters[client]"] = `${this.currentUser.specific_id}`;
      }
      return this.dataSvc.obtainAll<Booking[]>(StrapiEndpoints.BOOKINGS, _queries, this.mappingSvc.mapBookings)
        .pipe(tap(bookings => {
          if (this.currentUser?.role) {
            this.bookingsFacade.retrieveBookingsInfo(bookings, this.currentUser.role);
          }
        }));
    }
    return of([]);
  }

  /**
 * Retrieves a specific booking by its ID.
 *
 * @param {number} id - The ID of the booking to retrieve.
 * @returns {Observable<Booking>} An observable of the booking.
 */
  public getBooking(id: number): Observable<Booking> {
    return this.dataSvc.obtain<Booking>(StrapiEndpoints.BOOKINGS, id, this.mappingSvc.mapBooking, this.queries);
  }

  /**
 * Adds a new booking.
 *
 * @param {NewBooking} booking - The new booking to add.
 * @returns {Observable<Booking>} An observable of the added booking.
 */
  public addBooking(booking: NewBooking): Observable<Booking> {
    const body = this.mappingSvc.mapNewBookingPayload(booking);
    return this.dataSvc.save<Booking>(StrapiEndpoints.BOOKINGS, body, this.mappingSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

  /**
 * Updates an existing booking.
 *
 * @param {Booking} booking - The booking to update.
 * @returns {Observable<Booking>} An observable of the updated booking.
 */
  public updateBooking(booking: Booking): Observable<Booking> {
    const body = this.mappingSvc.mapBookingPayload(booking);
    return this.dataSvc.update<Booking>(StrapiEndpoints.BOOKINGS, booking.id, body, this.mappingSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

  /**
 * Deletes a specific booking by its ID.
 *
 * @param {number} id - The ID of the booking to delete.
 * @returns {Observable<Booking>} An observable of the deleted booking.
 */
  public deleteBooking(id: number): Observable<Booking> {
    return this.dataSvc.delete<Booking>(StrapiEndpoints.BOOKINGS, this.mappingSvc.mapBooking, id, {}).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

}
