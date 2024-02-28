import { OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { DocumentData, DocumentSnapshot, Unsubscribe, orderBy, where } from 'firebase/firestore';
import { DestinationsService } from './destinations.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';

export class SubscribableDestinationsService extends DestinationsService {
  private unsubscribe: Unsubscribe | null = null;
  private firebaseSvc = inject(FirebaseService);

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService,
  ) {
    super(dataSvc, mappingSvc)
    if (!this.unsubscribe) {
      this.subscribeToDestinations();
    }
  }

  private subscribeToDestinations() {
    const _destinations = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
    const orderByName = orderBy('name');
    this.unsubscribe = this.firebaseSvc.subscribeToCollectionQuery('destinations', _destinations, orderByName);
    _destinations.subscribe(res => {
      if (res) {
        this.destinationsFacade.saveDestinations(res.docs.map(doc => this.mappingSvc.mapDestination(doc)));
        this.destinationsFacade.savePaginatedDestinations(this.mappingSvc.mapPaginatedDestinations(res));
      }
    });
  }

  public override getAllDestinations(page: DocumentSnapshot<DocumentData> | number | null = 1): Observable<PaginatedDestination | null> {
    return of(null)
  }
}
