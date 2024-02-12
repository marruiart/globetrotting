import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
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
  private destinationFacade = inject(DestinationsFacade);
  private path: string = "/api/destinations";
  private body = (destination: NewDestination) => this.mappingSvc.mapDestinationPayload(destination);
  private queries: { [query: string]: string } = { 'sort': 'name' }

  private endOfData = false;
  public itemsCount: number = 0;

  private _destinationsPage = new BehaviorSubject<PaginatedDestination>(emptyPaginatedData);
  public destinationsPage$ = this._destinationsPage.asObservable();
  private _destinations = new BehaviorSubject<Destination[]>([]);
  public destinations$: Observable<Destination[]> = this._destinations.asObservable();


  constructor(
    protected dataSvc: DataService,
    protected mappingSvc: MappingService
  ) { }

  public getAllDestinations(page: DocumentSnapshot<DocumentData> | number | null = 1): Observable<PaginatedDestination | null> {
     if (page == null) {
      return of(null);
    }
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["pagination[page]"] = typeof page === 'number' ? `${page}` : page as DocumentSnapshot;
    return this.dataSvc.obtainAll<PaginatedDestination>(this.path, _queries, this.mappingSvc.mapPaginatedDestinations).pipe(tap(page => {
      if (page.data.length > 0) {
        this.endOfData = false;
        let _newDestinations: Destination[] = JSON.parse(JSON.stringify(this._destinations.value));
        page.data.forEach(destData => {
          let foundDest: Destination | undefined = this._destinations.value.find(dest => dest.name == destData.name);
          if (!foundDest) {
            _newDestinations.push(destData);
          }
        })
        this.itemsCount = _newDestinations.length;
        let _pagination = {
          data: page.data,
          pagination: page.pagination
        }
        this._destinations.next(_newDestinations);
        this._destinationsPage.next(_pagination);
        this.destinationFacade.updateDestinations(_newDestinations);
        this.destinationFacade.savePaginatedDestinations(_pagination);
      } else {
        this.endOfData = true;
      }
    })); 
  }

  public getNextDestinationsPage() {
    return this.getAllDestinations(this._destinationsPage.value.pagination.next);
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
    return this.dataSvc.update<Destination>(this.path, destination.id, this.body(destination), this.mappingSvc.mapDestination).pipe(tap(res => {
      let _newDestinations = JSON.parse(JSON.stringify(this._destinations.value));
      let index = -1;
      this._destinations.value.forEach((dest, i) => {
        if (res.id == dest.id) {
          index = i;
          return;
        }
      });
      if (index != -1) {
        _newDestinations[index] = res;
        this._destinations.next(_newDestinations);
      }
      if (updateObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public deleteDestination(id: number | string): Observable<Destination> {
    return this.dataSvc.delete<Destination>(this.path, this.mappingSvc.mapDestination, id, {}).pipe(tap(res => {
      let _newDestinations = JSON.parse(JSON.stringify(this._destinations.value));
      let index = -1;
      this._destinations.value.forEach((dest, i) => {
        if (res.id == dest.id) {
          index = i;
          return;
        }
      });
      if (index != -1) {
        _newDestinations.splice(index, 1);
        this._destinations.next(_newDestinations);
      }
      this.getAllDestinations().subscribe();
    }));;
  }

}
