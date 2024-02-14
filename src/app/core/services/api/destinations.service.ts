import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, switchMap, tap } from 'rxjs';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { MappingService } from './mapping.service';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { DataService } from './data.service';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { DestinationsFacade } from '../../+state/destinations/destinations.facade';

@Injectable({
  providedIn: 'root'
})
export class DestinationsService {
  protected destinationsFacade = inject(DestinationsFacade);
  private path: string = "/api/destinations";
  private body = (destination: NewDestination) => this.mappingSvc.mapDestinationPayload(destination);
  private queries: { [query: string]: string } = { 'sort': 'name' }

  private endOfData = false;
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

  public getAllDestinations(page: DocumentSnapshot<DocumentData> | number | null = 1): Observable<PaginatedDestination | null> {
    if (page == null) {
      return of(null);
    }
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["pagination[page]"] = typeof page === 'number' ? `${page}` : page as DocumentSnapshot;
    return this.dataSvc.obtainAll<PaginatedDestination>(this.path, _queries, this.mappingSvc.mapPaginatedDestinations).pipe(tap(page => {
      if (page.data.length > 0) {
        this.endOfData = false;
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
        this.endOfData = true;
      }
    }));
  }

  public getNextDestinationsPage() {
    return this.getAllDestinations(this._next);
  }

  public getDestination(id: string | number): Observable<Destination> {
    return this.dataSvc.obtain<Destination>(this.path, id, this.mappingSvc.mapDestination, this.queries);
  }

  public addDestination(destination: NewDestination, updateObs: boolean = true): Observable<Destination> {
    return this.dataSvc.save<Destination>(this.path, this.body(destination), this.mappingSvc.mapDestination).pipe(tap(_ => {
      if (updateObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public updateDestination(destination: Destination, updateObs: boolean = true): Observable<Destination> {
    return this.dataSvc.update<Destination>(this.path, destination.id, this.body(destination), this.mappingSvc.mapDestination).pipe(tap(_ => {
      if (updateObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public deleteDestination(id: number | string): Observable<Destination> {
    return this.dataSvc.delete<Destination>(this.path, this.mappingSvc.mapDestination, id, {}).pipe(tap(_ => {
      this.getAllDestinations().subscribe();
    }));
  }

}
