import { inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Destination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { DocumentData, DocumentSnapshot, Unsubscribe, orderBy } from 'firebase/firestore';
import { DestinationsService } from './destinations.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse, FormChanges } from '../../models/firebase-interfaces/firebase-data.interface';
import { Collections, StrapiEndpoints, getCollectionsChanges } from '../../utilities/utilities';

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
    this.unsubscribe = this.firebaseSvc.subscribeToCollectionQuery(Collections.DESTINATIONS, _destinations, orderByName);
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

  public override updateDestination(destination: Destination & FormChanges, updateObs: boolean = true): Observable<Destination> {
    const body = this.mappingSvc.mapDestinationPayload(destination);
    if (destination.updates) {
      const updates = getCollectionsChanges(destination.updates);
      return this.dataSvc.update<Destination>(StrapiEndpoints.DESTINATIONS, destination.id, body, this.mappingSvc.mapDestination).pipe(
        tap(_ => this.firebaseSvc.batchUpdateCollections(updates))
      )
    } else {
      return this.dataSvc.update<Destination>(StrapiEndpoints.DESTINATIONS, destination.id, body, this.mappingSvc.mapDestination);
    }
  }
}
