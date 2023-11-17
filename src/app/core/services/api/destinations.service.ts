import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Destination, NewDestination } from '../../models/destination.interface';
import { ApiService } from './api.service';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root'
})
export class DestinationsService extends ApiService {
  private path: string = "/api/destinations";
  private _destinations = new BehaviorSubject<Destination[]>([]);
  public destinations$ = this._destinations.asObservable();
  public jwt: string = "";
  private queries: { [query: string]: string } = {}

  private body: any = (destination: Destination) => {
    return {
      data: {
        id: destination.id,
        name: destination.name,
        type: destination.type,
        dimension: destination.dimension,
        price: destination.price,
        image: destination.image,
        description: destination.description
      }
    }
  }

  constructor(
    private mapSvc: MapService
  ) {
    super();
  }

  public getAllDestinations(): Observable<Destination[]> {
    return this.getAll<Destination[]>(this.path, this.queries, this.mapSvc.mapDestinations).pipe(tap(res => {
      this._destinations.next(res);
    }));
  }

  public getDestination(id: number): Observable<Destination> {
    return this.get<Destination>(this.path, id, this.mapSvc.mapDestination, this.queries);
  }

  public addDestination(destination: Destination | NewDestination, updateLocationObs: boolean = true): Observable<Destination> {
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
