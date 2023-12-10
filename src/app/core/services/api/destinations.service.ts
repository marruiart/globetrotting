import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data.interface';

@Injectable({
  providedIn: 'root'
})
export class DestinationsService extends ApiService {
  private path: string = "/api/destinations";
  private body = (destination: NewDestination) => this.mapSvc.mapDestinationPayload(destination);
  private queries: { [query: string]: string } = { 'sort': 'name' }

  private endOfData = false;
  public itemsCount: number = 0;

  private _destinationsPage = new BehaviorSubject<PaginatedDestination>(emptyPaginatedData);
  public destinationsPage$ = this._destinationsPage.asObservable();
  private _destinations = new BehaviorSubject<Destination[]>([]);
  public destinations$: Observable<Destination[]> = this._destinations.asObservable();


  constructor(
    private mapSvc: MappingService
  ) {
    super();
  }

  public getAllDestinations(page: number | null = 1): Observable<PaginatedDestination | null> {
    if (page == null) {
      return of(null);
    }
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["pagination[page]"] = `${page}`;
    return this.getAll<PaginatedDestination>(this.path, _queries, this.mapSvc.mapPaginatedDestinations).pipe(tap(page => {
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
      } else {
        this.endOfData = true;
      }
    }));
  }

  public getNextDestinationsPage() {
    return this.getAllDestinations(this._destinationsPage.value.pagination.page + 1);
  }

  public getDestination(id: number): Observable<Destination> {
    return this.get<Destination>(this.path, id, this.mapSvc.mapDestination, this.queries);
  }

  public addDestination(destination: NewDestination, updateObs: boolean = true): Observable<Destination> {
    return this.add<Destination>(this.path, this.body(destination), this.mapSvc.mapDestination).pipe(tap(_ => {
      if (updateObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public updateDestination(destination: Destination, updateObs: boolean = true): Observable<Destination> {
    return this.update<Destination>(this.path, destination.id, this.body(destination), this.mapSvc.mapDestination).pipe(tap(res => {
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

  public deleteDestination(id: number): Observable<Destination> {
    return this.delete<Destination>(this.path, this.mapSvc.mapDestination, id).pipe(tap(res => {
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
