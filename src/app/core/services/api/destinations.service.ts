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

  public getAllDestinations(page: number | null | undefined = 1): Observable<PaginatedDestination> {
    if (page) {
      this.queries["pagination[page]"] = `${page}`;
    } else {
      page = 1;
    }
    return this.getAll<PaginatedDestination>(this.path, this.queries, this.mapSvc.mapPaginatedDestinations).pipe(tap(res => {
      if (res.data.length > 0) {
        this.endOfData = false;
        let _newDestinations: Destination[] = JSON.parse(JSON.stringify(this._destinations.value));
        res.data.forEach(destData => {
          let foundDest: Destination | undefined = this._destinations.value.find(dest => dest.name == destData.name);
          if (!foundDest) {
            _newDestinations.push(destData);
          }
        })
        this.itemsCount = _newDestinations.length;
        console.log(this.itemsCount);
        let _pagination = {
          data: res.data,
          pagination: res.pagination
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
