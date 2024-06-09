import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { DestinationsFacade } from '../../+state/destinations/destinations.facade';
import { StrapiEndpoints } from '../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class DestinationsService {
  protected destinationsFacade = inject(DestinationsFacade);
  private queries: { [query: string]: string } = { 'sort': 'name' }

  private _endOfData = false;
  public itemsCount: number = 0;

  private _next: DocumentSnapshot<DocumentData> | number | null = null;
  private _destinations: Destination[] = [];


  constructor(
    protected dataSvc: DataService,
    protected mappingSvc: MappingService
  ) {
    this.destinationsFacade.destinations$.pipe(switchMap(destinations => {
      this._destinations = destinations;
      return this.destinationsFacade.destinationsPage$.pipe(tap(page =>
        this._next = page.pagination.next));
    }), catchError(error => { throw Error(error) })
    ).subscribe();
  }

  /**
 * Retrieves all destinations with pagination.
 * 
 * @param {DocumentSnapshot<DocumentData> | number | null} [page=1] - The page number or DocumentSnapshot for pagination. If null, returns null.
 * @returns {Observable<PaginatedDestination | null>} An observable of the paginated destinations.
 */
  public getAllDestinations(page: DocumentSnapshot<DocumentData> | number | null = 1): Observable<PaginatedDestination | null> {
    if (page == null) {
      return of(null);
    }
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["pagination[page]"] = typeof page === 'number' ? `${page}` : page as DocumentSnapshot;
    return this.dataSvc.obtainAll<PaginatedDestination>(StrapiEndpoints.DESTINATIONS, _queries, this.mappingSvc.mapPaginatedDestinations).pipe(tap(page => {
      if (page.data.length > 0) {
        this._endOfData = false;
        let _newDestinations: Destination[] = JSON.parse(JSON.stringify(this._destinations));
        page.data.forEach(destData => {
          let foundDest: Destination | undefined = this._destinations.find(dest => dest.name == destData.name);
          if (!foundDest) {
            _newDestinations.push(destData);
          }
        })
        this.itemsCount = _newDestinations.length;
        let _pagination = {
          data: page.data,
          pagination: page.pagination
        }
        this.destinationsFacade.saveDestinations(_newDestinations);
        this.destinationsFacade.savePaginatedDestinations(_pagination);
      } else {
        this._endOfData = true;
      }
    }));
  }

  /**
 * Retrieves the next page of destinations.
 * 
 * @returns {Observable<PaginatedDestination | null>} An observable of the next paginated destinations.
 */
  public getNextDestinationsPage() {
    return this.getAllDestinations(this._next);
  }

  /**
 * Retrieves a specific destination by its ID.
 * 
 * @param {string | number} id - The ID of the destination to retrieve.
 * @returns {Observable<Destination>} An observable of the destination.
 */
  public getDestination(id: string | number): Observable<Destination> {
    return this.dataSvc.obtain<Destination>(StrapiEndpoints.DESTINATIONS, id, this.mappingSvc.mapDestination, this.queries);
  }

  /**
 * Adds a new destination.
 * 
 * @param {NewDestination} destination - The new destination to add.
 * @param {boolean} [updateObs=true] - Whether to update the observable after adding the destination.
 * @returns {Observable<Destination>} An observable of the added destination.
 */
  public addDestination(destination: NewDestination, updateObs: boolean = true): Observable<Destination> {
    const body = this.mappingSvc.mapNewDestinationPayload(destination);
    return this.dataSvc.save<Destination>(StrapiEndpoints.DESTINATIONS, body, this.mappingSvc.mapDestination).pipe(tap(_ => {
      if (updateObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  /**
 * Updates an existing destination.
 * 
 * @param {Destination} destination - The destination to update.
 * @param {boolean} [updateObs=true] - Whether to update the observable after updating the destination.
 * @returns {Observable<Destination>} An observable of the updated destination.
 */
  public updateDestination(destination: Destination, updateObs: boolean = true): Observable<Destination> {
    const body = this.mappingSvc.mapDestinationPayload(destination);
    return this.dataSvc.update<Destination>(StrapiEndpoints.DESTINATIONS, destination.id, body, this.mappingSvc.mapDestination).pipe(tap(_ => {
      if (updateObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  /**
 * Deletes a specific destination by its ID.
 * 
 * @param {number | string} id - The ID of the destination to delete.
 * @returns {Observable<Destination>} An observable of the deleted destination.
 */
  public deleteDestination(id: number | string): Observable<Destination> {
    return this.dataSvc.delete<Destination>(StrapiEndpoints.DESTINATIONS, this.mappingSvc.mapDestination, id, {}).pipe(tap(_ => {
      this.getAllDestinations().subscribe();
    }));
  }

}
