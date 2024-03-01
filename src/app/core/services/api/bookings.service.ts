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

  public getBooking(id: number): Observable<Booking> {
    return this.dataSvc.obtain<Booking>(StrapiEndpoints.BOOKINGS, id, this.mappingSvc.mapBooking, this.queries);
  }

  public addBooking(booking: NewBooking): Observable<Booking> {
    const body = this.mappingSvc.mapNewBookingPayload(booking);
    return this.dataSvc.save<Booking>(StrapiEndpoints.BOOKINGS, body, this.mappingSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

  public updateBooking(booking: Booking): Observable<Booking> {
    const body = this.mappingSvc.mapBookingPayload(booking);
    return this.dataSvc.update<Booking>(StrapiEndpoints.BOOKINGS, booking.id, body, this.mappingSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

  public deleteBooking(id: number): Observable<Booking> {
    return this.dataSvc.delete<Booking>(StrapiEndpoints.BOOKINGS, this.mappingSvc.mapBooking, id, {}).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

}
