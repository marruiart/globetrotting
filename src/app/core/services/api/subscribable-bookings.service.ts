import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, zip } from 'rxjs';
import { Booking } from '../../models/globetrotting/booking.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { BookingsService } from './bookings.service';
import { FirebaseCollectionResponse, } from '../../models/firebase-interfaces/firebase-data.interface';
import { QueryConstraint, Unsubscribe, where } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class SubscribableBookingsService extends BookingsService {
  private unsubscribe: Unsubscribe | null = null;
  private firebaseSvc = inject(FirebaseService);

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService
  ) {
    super(dataSvc, mappingSvc);
    this.authFacade.currentUser$.subscribe(user => {
      if (!this.unsubscribe && user) {
        this.subscribeToBookings();
      } else if (!user) {
        this.unsubscribe = null;
      }
    });
  }

  private subscribeToBookings() {
    // TODO check that when user logout unsubscribe is null again
    let _bookings = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
    if (this.currentUser?.role != 'ADMIN') {
      let _notConfirmed = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
      const userTypeId = this.currentUser!.role === 'AUTHENTICATED' ? 'client_id' : 'agent_id';
      const byUser: QueryConstraint = where(userTypeId, '==', this.currentUser!.user_id);
      const byConfirmation: QueryConstraint = where('isConfirmed', '==', false);
      this.firebaseSvc.subscribeToCollectionQuery('bookings', _notConfirmed, byConfirmation);
      this.unsubscribe = this.firebaseSvc.subscribeToCollectionQuery('bookings', _bookings, byUser);
      zip(_bookings, _notConfirmed).subscribe(([userBookings, notConfirmed]) => {
        if (userBookings && notConfirmed) {
          const _userBookings = userBookings.docs.map(doc => this.mappingSvc.mapBooking(doc));
          const _notConfirmed = notConfirmed.docs.map(doc => this.mappingSvc.mapBooking(doc));
          const bookings = [..._userBookings, ..._notConfirmed]
          if (this.currentUser) {
            this.bookingsFacade.saveBookingsTable(bookings, this.currentUser.role);
          }
        }
      });
    } else {
      this.unsubscribe = this.firebaseSvc.subscribeToCollection('bookings', _bookings);
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

  public override getAllBookings(): Observable<Booking[]> {
    return of([]);
  }

}
