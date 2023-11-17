import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Destination, NewDestination } from '../models/destination.interface';
import { ApiService } from './api.service';


let mapDestination = (res: any) => {
  return {
    id: res.data.id,
    name: res.data.attributes.name,
    type: res.data.attributes.type,
    dimension: res.data.attributes.dimension,
    price: res.data.attributes.price,
    image: res.data.attributes.image,
    description: res.data.attributes.description
  }
}

let mapDestinations = (res: any) => {
  return Array.from(res.data).reduce((prev: Destination[], destinationRes: any): Destination[] => {
    let _destination: Destination = {
      id: destinationRes.id,
      name: destinationRes.attributes.name,
      type: destinationRes.attributes.type,
      dimension: destinationRes.attributes.dimension,
      price: destinationRes.attributes.price,
      image: destinationRes.attributes.image,
      description: destinationRes.attributes.description
    }
    prev.push(_destination);
    return prev;
  }, []);
}

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

  constructor() {
    super();
  }

  public getAllDestinations(): Observable<Destination[]> {
    return this.getAll<Destination[]>(this.path, this.queries, mapDestinations).pipe(tap(res => {
      this._destinations.next(res);
    }));
  }

  public getDestination(id: number): Observable<Destination> {
    return this.get<Destination>(this.path, id, mapDestination, this.queries);
  }

  public addDestination(destination: Destination | NewDestination, updateLocationObs: boolean = true): Observable<Destination> {
    return this.add<Destination>(this.path, this.body(destination), mapDestination).pipe(tap(_ => {
      if (updateLocationObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public updateDestination(destination: Destination, updateLocationObs: boolean = true): Observable<Destination> {
    return this.update<Destination>(this.path, destination.id, this.body(destination), mapDestination).pipe(tap(_ => {
      if (updateLocationObs) {
        this.getAllDestinations().subscribe();
      }
    }));
  }

  public deleteDestination(id: number): Observable<Destination> {
    return this.delete<Destination>(this.path, mapDestination, id).pipe(tap(_ => {
      this.getAllDestinations().subscribe();
    }));;
  }

}
