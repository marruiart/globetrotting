import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, of, tap } from 'rxjs';
import { Booking, NewBooking } from '../../models/globetrotting/booking.interface';
import { ApiService } from './api.service';
import { AuthFacade } from '../../libs/auth/auth.facade';
import { MappingService } from './mapping.service';

@Injectable({
  providedIn: 'root'
})
export class BookingsService extends ApiService {
  private path: string = "/api/bookings";
  private _favs: BehaviorSubject<Booking[]> = new BehaviorSubject<Booking[]>([]);
  public favs$: Observable<Booking[]> = this._favs.asObservable();
  private _userBookings: BehaviorSubject<Booking[]> = new BehaviorSubject<Booking[]>([]);
  public userBookings$: Observable<Booking[]> = this._userBookings.asObservable();
  private queries: { [query: string]: string } = {
    "populate": "destination,client,agent"
  }
  private userRole: string | null = null;

  constructor(
    private authFacade: AuthFacade,
    private mapSvc: MappingService
  ) {
    super();
    this.authFacade.role$.subscribe(role => {
      this.userRole = role;
    })
  }

  public getAllBookings(): Observable<Booking[]> {
    return this.getAll<Booking[]>(this.path, this.queries, this.mapSvc.mapBookings).pipe(tap(res => {
      this._favs.next(res);
    }));
  }

  public getAllClientBookings(): Observable<Booking[]> {
    return this.authFacade.userId$.pipe(concatMap(id => {
      if (id) {
        let _queries = JSON.parse(JSON.stringify(this.queries));
        _queries["filters[client]"] = `${id}`;
        return this.getAll<Booking[]>(this.path, _queries, this.mapSvc.mapBookings).pipe(tap(res => {
          this._userBookings.next(res);
        }));
      } else {
        return of([]);
      }
    }))
  }

  public getAllAgentBookings(): Observable<Booking[]> {
    return this.authFacade.userId$.pipe(concatMap(id => {
      if (id) {
        let _queries = JSON.parse(JSON.stringify(this.queries));
        _queries["filters[agent]"] = `${id}`;
        return this.getAll<Booking[]>(this.path, _queries, this.mapSvc.mapBookings).pipe(tap(res => {
          this._userBookings.next(res);
        }));
      } else {
        return of([]);
      }
    }))
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
    if (this.userRole == 'AUTHENTICATED') {
      this.getAllClientBookings().subscribe();
    } else if (this.userRole == 'ADMIN' || this.userRole == 'AGENT') {
      this.getAllAgentBookings().subscribe();
    }
  }
}
