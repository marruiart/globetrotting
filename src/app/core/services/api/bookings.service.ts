import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, of, tap } from 'rxjs';
import { Booking, NewBooking } from '../../models/globetrotting/booking.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { UserFacade } from '../../libs/load-user/load-user.facade';
import { AuthFacade } from '../../libs/auth/auth.facade';
import { Client } from '../../models/globetrotting/client.interface';
import { Agent } from '../../models/globetrotting/agent.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingsService extends ApiService {
  private path: string = "/api/bookings";
  private currentUser: Client | Agent | null = null;
  private _userBookings: BehaviorSubject<Booking[]> = new BehaviorSubject<Booking[]>([]);
  public userBookings$: Observable<Booking[]> = this._userBookings.asObservable();
  private queries: { [query: string]: string } = {
    "populate": "destination,client,agent"
  }

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
    return this.getAll<Booking[]>(this.path, this.queries, this.mapSvc.mapBookings);
  }

  public getAllClientBookings(): Observable<Booking[]> {
    if (this.currentUser && this.currentUser.type == 'AUTHENTICATED') {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[client]"] = `${this.currentUser.id}`;
      return this.getAll<Booking[]>(this.path, _queries, this.mapSvc.mapBookings).pipe(tap(res => {
        this._userBookings.next(res);
      }));
    } else {
      return of([]);
    }
  }

  public getAllAgentBookings(): Observable<Booking[]> {
    if (this.currentUser && this.currentUser.type == 'AGENT') {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[agent]"] = `${this.currentUser.id}`;
      return this.getAll<Booking[]>(this.path, _queries, this.mapSvc.mapBookings).pipe(tap(res => {
        this._userBookings.next(res);
      }));
    } else {
      return of([]);
    }
  }

  public getBooking(id: number): Observable<Booking> {
    return this.get<Booking>(this.path, id, this.mapSvc.mapBooking, this.queries);
  }

  public addBooking(fav: NewBooking): Observable<Booking> {
    return this.add<Booking>(this.path, this.mapSvc.mapBookingPayload(fav), this.mapSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
      this.updateCurrentUserBookings();
    }));
  }

  public updateBooking(fav: Booking): Observable<Booking> {
    return this.update<Booking>(this.path, fav.id, this.mapSvc.mapBookingPayload(fav), this.mapSvc.mapBooking).pipe(tap(_ => {
      this.getAllBookings().subscribe();
      this.updateCurrentUserBookings();
    }));
  }

  public deleteBooking(id: number): Observable<Booking> {
    return this.delete<Booking>(this.path, this.mapSvc.mapBookingPayload, id).pipe(tap(_ => {
      this.getAllBookings().subscribe();
      this.updateCurrentUserBookings();
    }));;
  }

  private updateCurrentUserBookings() {
    if (this.currentUser?.type == 'AUTHENTICATED') {
      this.getAllClientBookings().subscribe();
    } else if (this.currentUser?.type == 'AGENT') {
      this.getAllAgentBookings().subscribe();
    }
  }
}
