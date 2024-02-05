import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, of, tap } from 'rxjs';
import { Fav, NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { MappingService } from '../mapping.service';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { DataService } from '../data.service';


export class FirebaseFavoritesService {
  private path: string = "/api/favorites";
  private body = (fav: NewFav) => this.mapSvc.mapFavPayload(fav);

  private authFacade: AuthFacade = inject(AuthFacade);
  private _favs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public favs$: Observable<Fav[]> = this._favs.asObservable();
  private _clientFavs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public clientFavs$: Observable<Fav[]> = this._clientFavs.asObservable();
  private queries: { [query: string]: string } = {}
  private userRole: string | null = null;

  constructor(
    private dataSvc: DataService,
    private mapSvc: MappingService
  ) {
    this.authFacade.role$.subscribe(role => {
      this.userRole = role;
    })
  }

  public getAllFavs(): Observable<Fav[]> {
    return this.dataSvc.obtainAll<Fav[]>(this.path, this.queries, this.mapSvc.mapFavs).pipe(tap(res => {
      this._favs.next(res);
    }));
  }

  public getAllClientFavs(): Observable<Fav[]> {
    return this.authFacade.userId$.pipe(concatMap(id => {
      if (id) {
        let _queries = JSON.parse(JSON.stringify(this.queries));
        _queries["filters[client]"] = `${id}`;
        return this.dataSvc.obtainAll<Fav[]>(this.path, _queries, this.mapSvc.mapFavs).pipe(tap(res => {
          this._clientFavs.next(res);
        }));
      } else {
        return of([]);
      }
    }))
  }

  public getFav(id: number): Observable<Fav> {
    return this.dataSvc.obtain<Fav>(this.path, id, this.body, this.queries);
  }

  public addFav(fav: NewFav): Observable<Fav> {
    if (fav.client_id) {
      return this.dataSvc.updateArray<Fav>(this.path, fav.client_id, 'destinations', fav.destination_id, this.mapSvc.mapFav);
    } else {
      throw new Error('Error: User id was not provided');
    }
  }

  public updateFav(fav: Fav): Observable<Fav> {
    return this.dataSvc.update<Fav>(this.path, fav.id, this.body(fav), this.body);
  }

  public deleteFav(id: number): Observable<Fav> {
    return this.dataSvc.delete<Fav>(this.path, this.body, id, {});
  }

}
