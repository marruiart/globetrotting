import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Booking, NewBooking } from '../../models/globetrotting/booking.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { StrapiPayload } from '../../models/strapi-interfaces/strapi-data.interface';
import { DataService } from './data.service';
import { AdminAgentOrClientUser } from '../../models/globetrotting/user.interface';
import { AuthFacade } from '../../+state/auth/auth.facade';
import { BookingsFacade } from '../../+state/bookings/bookings.facade';

@Injectable({
  providedIn: 'root'
})
export class BookingsService extends ApiService {
  protected authFacade = inject(AuthFacade);
  protected bookingsFacade = inject(BookingsFacade);
  private path: string = "/api/bookings";
  private body = (booking: NewBooking) => this.mappingSvc.mapBookingPayload(booking);
  private queries: { [query: string]: string } = {
    "populate": "destination.name,client.user,agent.user",
    "sort": "destination.name"
  }

  protected currentUser: AdminAgentOrClientUser | null = null;

  constructor(
    private dataSvc: DataService,
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
      return this.dataSvc.obtainAll<Booking[]>(this.path, _queries, this.mappingSvc.mapBookings)
        .pipe(tap(bookings => {
          if (this.currentUser?.role) {
            this.bookingsFacade.retrieveBookingsInfo(bookings, this.currentUser.role);
          }
        }));
    }
    return of([]);
  }

  public getBooking(id: number): Observable<Booking> {
    return this.dataSvc.obtain<Booking>(this.path, id, this.mappingSvc.mapBooking, this.queries);
  }

  public addBooking(booking: NewBooking): Observable<Booking> {
    return this.dataSvc.save<Booking>(this.path, this.body(booking), this.mappingSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

  public updateBooking(booking: StrapiPayload<any>): Observable<Booking> {
    return this.dataSvc.update<Booking>(this.path, booking.data.id, this.body(booking.data), this.mappingSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

  public deleteBooking(id: number): Observable<Booking> {
    return this.dataSvc.delete<Booking>(this.path, this.mappingSvc.mapBooking, id, {}).pipe(tap(_ => {
      this.getAllBookings().subscribe();
    }));
  }

}
