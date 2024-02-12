import { inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { DocumentData, DocumentSnapshot, Unsubscribe } from 'firebase/firestore';
import { DestinationsService } from './destinations.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';
import { DestinationsFacade } from '../../+state/destinations/destinations.facade';

export class SuscribableDestinationsService extends DestinationsService {
  private destinationsFacade = inject(DestinationsFacade);
  private unsubscribe!: Unsubscribe | null;

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService,
    private firebaseSvc: FirebaseService
  ) {
    super(dataSvc, mappingSvc)
    if (!this.unsubscribe) {
      this.subscribeToDestinations();
    }
  }

  private subscribeToDestinations() {
    const _destinations = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
    this.unsubscribe = this.firebaseSvc.subscribeToCollection('destinations', _destinations);
    _destinations.subscribe(res => {
      if (res) {
        this.destinationsFacade.updateDestinations(res.docs.map(doc => this.mappingSvc.mapDestination(doc)));
        this.destinationsFacade.savePaginatedDestinations(this.mappingSvc.mapPaginatedDestinations(res));
      }
    });
  }

  public override getAllDestinations(page: DocumentSnapshot<DocumentData> | number | null = 1): Observable<PaginatedDestination | null> {
    return of(null)
  }
}
