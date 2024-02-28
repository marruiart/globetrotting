import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { Booking } from '../../models/globetrotting/booking.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { BookingsService } from './bookings.service';
import { FirebaseCollectionResponse, } from '../../models/firebase-interfaces/firebase-data.interface';
import { QueryConstraint, Unsubscribe, where, orderBy } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class SubscribableBookingsService extends BookingsService {
  private unsubscriptions: (Unsubscribe | null)[] = [];
  private firebaseSvc = inject(FirebaseService);

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService
  ) {
    super(dataSvc, mappingSvc);
    this.authFacade.currentUser$.subscribe(user => {
      if (this.unsubscriptions.length == 0 && user) {
        this.unsubscriptions = [];
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
    let _bookings = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
    if (this.currentUser?.role != 'ADMIN') {
      let _notConfirmed = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
      this.subscribeToNotConfirmedBookings(_notConfirmed);
      this.subscribeToBookingsByUser(_bookings);

      zip(_bookings, _notConfirmed).subscribe(([userBookings, notConfirmed]) => {
        if (userBookings && notConfirmed) {
          // TODO check duplicates in userBookings and not confirmed
          const _userBookings = userBookings.docs.map(doc => this.mappingSvc.mapBooking(doc));
          const _notConfirmed = notConfirmed.docs.map(doc => this.mappingSvc.mapBooking(doc));
          const bookings = [..._userBookings, ..._notConfirmed];
          bookings.sort((a, b) => {
            if (a.destinationName && b.destinationName) {
              return (a.destinationName > b.destinationName) ? 1 : ((b.destinationName > a.destinationName) ? -1 : 0)
            } return 0;
          })
          if (this.currentUser) {
            this.bookingsFacade.saveBookingsTable(bookings, this.currentUser.role);
          }
        }
      });
    } else {
      this.unsubscriptions.push(this.firebaseSvc.subscribeToCollection('bookings', _bookings));
      _bookings.subscribe(res => {
        if (res) {
          const bookings = res.docs.map(doc => this.mappingSvc.mapBooking(doc));
          if (this.currentUser) {
            this.bookingsFacade.saveBookingsTable(bookings, this.currentUser.role);
          }
        }
      });
    }
  }

  private subscribeToNotConfirmedBookings(behaviorSubject: BehaviorSubject<FirebaseCollectionResponse | null>) {
    const filterNotConfirmed: QueryConstraint = where('isConfirmed', '==', false);
    const orderByDestinationName = orderBy('destinationName');
    this.unsubscriptions.push(this.firebaseSvc.subscribeToCollectionQuery('bookings', behaviorSubject, filterNotConfirmed, orderByDestinationName));
  }

  private subscribeToBookingsByUser(behaviorSubject: BehaviorSubject<FirebaseCollectionResponse | null>) {
    const userTypeId = this.currentUser!.role === 'AUTHENTICATED' ? 'client_id' : 'agent_id';
    const orderByDestinationName = orderBy('destinationName');
    const byUser: QueryConstraint = where(userTypeId, '==', this.currentUser!.user_id);
    this.unsubscriptions.push(this.firebaseSvc.subscribeToCollectionQuery('bookings', behaviorSubject, byUser, orderByDestinationName));
  }

  public override getAllBookings(): Observable<Booking[]> {
    return of([]);
  }

}
