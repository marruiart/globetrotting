import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { ApiService } from './api.service';
import { MapService } from './map.service';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data';

@Injectable({
  providedIn: 'root'
})
export class DestinationsService extends ApiService {
  private path: string = "/api/destinations";
  private _pagination = new BehaviorSubject<PaginatedDestination>(emptyPaginatedData);
  public pagination$ = this._pagination.asObservable();
  private _destinations = new BehaviorSubject<Destination[]>([]);
  public destinations$ = this._destinations.asObservable();
  private queries: { [query: string]: string } = { "populate": "image" }
  private body = (destination: NewDestination) => this.mapSvc.mapDestinationPayload(destination);

  constructor(
    private mapSvc: MapService
  ) {
    super();
  }

  public getAllDestinations(): Observable<PaginatedDestination> {
    return this.getAll<PaginatedDestination>(this.path, this.queries, this.mapSvc.mapDestinations).pipe(tap(res => {
      this._destinations.next(res.data);
      this._pagination.next(res);
    }));
  }

  public getDestination(id: number): Observable<Destination> {
    return this.get<Destination>(this.path, id, this.mapSvc.mapDestination, this.queries);
  }

  public addDestination(destination: NewDestination, updateLocationObs: boolean = true): Observable<Destination> {
    return this.add<Destination>(this.path, this.body(destination), this.mapSvc.mapDestination).pipe(tap(_ => {
      if (updateLocationObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public updateDestination(destination: Destination, updateLocationObs: boolean = true): Observable<Destination> {
    return this.update<Destination>(this.path, destination.id, this.body(destination), this.mapSvc.mapDestination).pipe(tap(_ => {
      if (updateLocationObs) {
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
