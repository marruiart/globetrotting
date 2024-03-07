import { Injectable, inject } from '@angular/core';
import { QueryConstraint, Unsubscribe, orderBy, where } from 'firebase/firestore';
import { BehaviorSubject, Observable, combineLatest, forkJoin, from, merge, mergeAll, of, switchMap, zip } from 'rxjs';
import { FirebaseCollectionResponse, } from '../../models/firebase-interfaces/firebase-data.interface';
import { Booking } from '../../models/globetrotting/booking.interface';
import { User } from '../../models/globetrotting/user.interface';
import { Collections, Roles, StrapiEndpoints, getUserName } from '../../utilities/utilities';
import { FirebaseService } from '../firebase/firebase.service';
import { BookingsService } from './bookings.service';
import { DataService } from './data.service';
import { MappingService } from './mapping.service';

@Injectable({
  providedIn: 'root'
})
export class SubscribableBookingsService extends BookingsService {
  private _bookings = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
  private _notConfirmedBookings = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
  private unsubscriptions: (Unsubscribe | null)[] = [];
  private firebaseSvc = inject(FirebaseService);

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService
  ) {
    super(dataSvc, mappingSvc);
    this.authFacade.currentUser$.subscribe(user => {
      if (this.unsubscriptions.length == 0 && user) {
        this.subscribeToBookings();
      } else if (!user) {
        for (let unsubscribe of this.unsubscriptions) {
          if (unsubscribe) {
            unsubscribe();
          }
        }
        this.unsubscriptions = [];
      }
    });
  }

  private subscribeToBookings() {
    // TODO check that when user logout unsubscribe is null again
    switch (this.currentUser?.role) {
      case Roles.ADMIN:
        this.subscribeToBookingsAsAdmin();
        break;
      case Roles.AGENT:
        this.subscribeToBookingsAsAgent();
        break;
      case Roles.AUTHENTICATED:
        this.subscribeToBookingsAsClient();
        break;
    }
  }

  private subscribeToBookingsAsAdmin() {
    const orderByDestinationName = orderBy('destinationName');
    this.unsubscriptions.push(this.firebaseSvc.subscribeToCollectionQuery(Collections.BOOKINGS, this._bookings, orderByDestinationName));
    this._bookings.subscribe(res => {
      if (res) {
        const bookings = res.docs.map(doc => this.mappingSvc.mapBooking(doc));
        if (this.currentUser) {
          this.bookingsFacade.saveBookingsTable(bookings, this.currentUser.role);
        }
      }
    });
  }

  private subscribeToBookingsAsAgent() {
    this.subscribeToNotConfirmedBookings();
    this.subscribeToBookingsByUser();

    combineLatest([this._bookings, this._notConfirmedBookings]).subscribe(([userBookings, notConfirmed]) => {
        const _userBookings = userBookings?.docs.map(doc => this.mappingSvc.mapBooking(doc)) ?? [];
        const _notConfirmed = notConfirmed?.docs.map(doc => this.mappingSvc.mapBooking(doc)) ?? [];
        const bookings = this.sortBookings([..._userBookings, ..._notConfirmed]);
        if (this.currentUser) {
          this.bookingsFacade.saveBookingsTable(bookings, this.currentUser.role);
        }
    });
  }

  private subscribeToBookingsAsClient() {
    this.subscribeToBookingsByUser();

    this._bookings.subscribe(userBookings => {
      if (userBookings) {
        const bookings = this.sortBookings(userBookings.docs.map(doc => this.mappingSvc.mapBooking(doc)));
        if (this.currentUser) {
          this.bookingsFacade.saveBookingsTable(bookings, this.currentUser.role);
        }
      }
    });
  }

  private sortBookings(bookings: Booking[]) {
    bookings.sort((a, b) => {
      if (a.destinationName && b.destinationName) {
        return (a.destinationName > b.destinationName) ? 1 : ((b.destinationName > a.destinationName) ? -1 : 0)
      } return 0;
    })
    return bookings;
  }

  private subscribeToNotConfirmedBookings() {
    const filterNotConfirmed: QueryConstraint = where('isConfirmed', '==', false);
    const orderByDestinationName = orderBy('destinationName');
    this.unsubscriptions.push(this.firebaseSvc.subscribeToCollectionQuery(Collections.BOOKINGS, this._notConfirmedBookings, filterNotConfirmed, orderByDestinationName));
  }

  private subscribeToBookingsByUser() {
    const userTypeId = this.currentUser!.role === Roles.AUTHENTICATED ? 'client_id' : 'agent_id';
    const orderByDestinationName = orderBy('destinationName');
    const byUser: QueryConstraint = where(userTypeId, '==', this.currentUser!.user_id);
    this.unsubscriptions.push(this.firebaseSvc.subscribeToCollectionQuery(Collections.BOOKINGS, this._bookings, byUser, orderByDestinationName));
  }

  public override getAllBookings(): Observable<Booking[]> {
    return of([]);
  }

  public override updateBooking(booking: Booking): Observable<Booking> {
    return from(this.firebaseSvc.getDocument(Collections.USERS, booking.agent_id as string)).pipe(switchMap(doc => {
      const agentName = getUserName(doc.data as User);
      const body = this.mappingSvc.mapBookingPayload({ ...booking, agentName: agentName });
      return this.dataSvc.update<Booking>(StrapiEndpoints.BOOKINGS, booking.id, body, this.mappingSvc.mapBooking);
    }))
  }

}
