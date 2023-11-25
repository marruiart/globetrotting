import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, lastValueFrom, of, tap } from 'rxjs';
import { Fav, NewFav } from '../../models/globetrotting/fav.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { AuthFacade } from '../../libs/auth/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService extends ApiService {
  private path: string = "/api/favorites";
  private _favs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public favs$: Observable<Fav[]> = this._favs.asObservable();
  private _clientFavs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public clientFavs$: Observable<Fav[]> = this._clientFavs.asObservable();
  private queries: { [query: string]: string } = {}

  private body: any = (fav: Fav) => {
    return {
      data: {
        destination: fav.destination_id,
        client: fav.client_id
      }
    }
  }

  constructor(
    private authFacade: AuthFacade,
    private mapSvc: MappingService
  ) {
    super();
  }

  public getAllFavs(): Observable<Fav[]> {
    return this.getAll<Fav[]>(this.path, this.queries, this.mapSvc.mapFavs).pipe(tap(res => {
      this._favs.next(res);
    }));
  }

  public getAllClientFavs(): Observable<Fav[]> {
    return this.authFacade.userId$.pipe(concatMap(id => {
      if (id) {
        let _queries = JSON.parse(JSON.stringify(this.queries));
        _queries["filters[client]"] = `${id}`;
        return this.getAll<Fav[]>(this.path, _queries, this.mapSvc.mapFavs).pipe(tap(res => {
          this._clientFavs.next(res);
        }));
      } else {
        return of([]);
      }
    }))
  }

  public getFav(id: number): Observable<Fav> {
    return this.get<Fav>(this.path, id, this.mapSvc.mapFav, this.queries);
  }

  public addFav(fav: NewFav, updateObs: boolean = true): Observable<Fav> {
    return this.add<Fav>(this.path, this.body(fav), this.mapSvc.mapFav).pipe(tap(_ => {
      if (updateObs) {
        this.getAllFavs().subscribe();
      }
    }));
  }

  public updateFav(fav: Fav, updateObs: boolean = true): Observable<Fav> {
    return this.update<Fav>(this.path, fav.id, this.body(fav), this.mapSvc.mapFav).pipe(tap(_ => {
      if (updateObs) {
        this.getAllFavs().subscribe();
      }
    }));
  }

  public deleteFav(id: number): Observable<Fav> {
    return this.delete<Fav>(this.path, this.mapSvc.mapFav, id).pipe(tap(_ => {
      this.getAllFavs().subscribe();
    }));;
  }

}
