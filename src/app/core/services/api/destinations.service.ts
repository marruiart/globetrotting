import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data.interface';

@Injectable({
  providedIn: 'root'
})
export class DestinationsService extends ApiService {
  private path: string = "/api/destinations";

  private endOfData = false;
  public itemsCount: number = 0;

  private _destinationsPage = new BehaviorSubject<PaginatedDestination>(emptyPaginatedData);
  public destinationsPage$ = this._destinationsPage.asObservable();
  private _destinations = new BehaviorSubject<Destination[]>([]);
  public destinations$: Observable<Destination[]> = this._destinations.asObservable();

  private queries: { [query: string]: string } = { "populate": "image" }
  private body = (destination: NewDestination) => this.mapSvc.mapDestinationPayload(destination);

  constructor(
    private mapSvc: MappingService
  ) {
    super();
  }

  public getAllDestinations(page: number | null | undefined = undefined): Observable<PaginatedDestination> {
    if (page) {
      this.queries["pagination[page]"] = `${page}`;
    }
    return this.getAll<PaginatedDestination>(this.path, this.queries, this.mapSvc.mapPaginatedDestinations).pipe(tap(res => {
      if (res.data.length > 0) {
        this.endOfData = false;
        let _destinations: Destination[] = [...res.data].reduce((
          prev: Destination[], data: Destination): Destination[] => {
          // Check if each of the new elements already existed, if not, push them into _destinations
          if (!this._destinations.value.includes(data)) {
            prev.push(data);
          }
          return prev;
        }, [...this._destinations.value]);
        this.itemsCount = _destinations.length;
        let _pagination = {
          data: _destinations,
          pagination: res.pagination
        }
        this._destinations.next(_destinations);
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
    return this.update<Destination>(this.path, destination.id, this.body(destination), this.mapSvc.mapDestination).pipe(tap(_ => {
      if (updateObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public deleteDestination(id: number): Observable<Destination> {
    return this.delete<Destination>(this.path, this.mapSvc.mapDestination, id).pipe(tap(_ => {
      this.getAllDestinations().subscribe();
    }));;
  }

}
