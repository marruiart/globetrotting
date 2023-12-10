import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Booking, NewBooking } from '../../models/globetrotting/booking.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { UserFacade } from '../../+state/load-user/load-user.facade';
import { Client } from '../../models/globetrotting/client.interface';
import { TravelAgent } from '../../models/globetrotting/agent.interface';
import { StrapiPayload } from '../../models/strapi-interfaces/strapi-data.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingsService extends ApiService {
  private path: string = "/api/bookings";
  private body = (booking: NewBooking) => this.mapSvc.mapBookingPayload(booking);
  private queries: { [query: string]: string } = {
    "populate": "destination,client,agent"
  }

  private currentUser: Client | TravelAgent | null = null;
  private _userBookings: BehaviorSubject<Booking[]> = new BehaviorSubject<Booking[]>([]);
  public userBookings$: Observable<Booking[]> = this._userBookings.asObservable();
  private _allBookings: BehaviorSubject<Booking[]> = new BehaviorSubject<Booking[]>([]);
  public allBookings$: Observable<Booking[]> = this._allBookings.asObservable();

  constructor(
    private userFacade: UserFacade,
    private mapSvc: MappingService
  ) {
    super();
    this.userFacade.currentSpecificUser$.subscribe(specificUser => {
      this.currentUser = specificUser;
    })
  }

  public getAllBookings(): Observable<Booking[]> {
    return this.getAll<Booking[]>(this.path, this.queries, this.mapSvc.mapBookings)
      .pipe(tap(res => {
        this._allBookings.next(res);
      }));
  }

  public getAllUserBookings(): Observable<Booking[]> {
    if (this.currentUser) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      if (this.currentUser.type == 'AUTHENTICATED') {
        _queries["filters[client]"] = `${this.currentUser.id}`;
      } else if (this.currentUser.type == 'AGENT') {
        _queries["filters[agent]"] = `${this.currentUser.id}`;
      }
      return this.getAll<Booking[]>(this.path, _queries, this.mapSvc.mapBookings).pipe(tap(res => {
        this._userBookings.next(res);
      }));
    }
    return of([]);
  }

  public getBooking(id: number): Observable<Booking> {
    return this.get<Booking>(this.path, id, this.mapSvc.mapBooking, this.queries);
  }

  public addBooking(booking: NewBooking): Observable<Booking> {
    return this.add<Booking>(this.path, this.body(booking), this.mapSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
      this.updateCurrentUserBookings();
    }));
  }

  public updateBooking(booking: StrapiPayload<any>): Observable<Booking> {
    return this.update<Booking>(this.path, booking.data.id, this.body(booking.data), this.mapSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
      this.updateCurrentUserBookings();
    }));
  }

  public deleteBooking(id: number): Observable<Booking> {
    return this.delete<Booking>(this.path, this.mapSvc.mapBooking, id).pipe(tap(_ => {
      this.getAllBookings().subscribe();
      this.updateCurrentUserBookings();
    }));;
  }

  private updateCurrentUserBookings() {
    if (this.currentUser?.type == 'AUTHENTICATED') {
      this.getAllUserBookings().subscribe();
    }
  }
}
