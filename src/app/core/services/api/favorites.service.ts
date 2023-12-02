import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, of, tap } from 'rxjs';
import { Fav, NewFav } from '../../models/globetrotting/fav.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { AuthFacade } from '../../libs/auth/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService extends ApiService {
  private path: string = "/api/favorites";
  private favsBody = (favs: NewFav[]) => this.mapSvc.mapFavs(favs);
  private favBody = (fav: NewFav) => this.mapSvc.mapFav(fav);

  private _favs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public favs$: Observable<Fav[]> = this._favs.asObservable();
  private _clientFavs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public clientFavs$: Observable<Fav[]> = this._clientFavs.asObservable();
  private queries: { [query: string]: string } = {}
  private userRole: string | null = null;

  constructor(
    private authFacade: AuthFacade,
    private mapSvc: MappingService
  ) {
    super();
    this.authFacade.role$.subscribe(role => {
      this.userRole = role;
    })
  }

  public getAllFavs(): Observable<Fav[]> {
    return this.getAll<Fav[]>(this.path, this.queries, this.favsBody).pipe(tap(res => {
      this._favs.next(res);
    }));
  }

  public getAllClientFavs(): Observable<Fav[]> {
    return this.authFacade.userId$.pipe(concatMap(id => {
      if (id) {
        let _queries = JSON.parse(JSON.stringify(this.queries));
        _queries["filters[client]"] = `${id}`;
        return this.getAll<Fav[]>(this.path, _queries, this.favsBody).pipe(tap(res => {
          this._clientFavs.next(res);
        }));
      } else {
        return of([]);
      }
    }))
  }

  public getFav(id: number): Observable<Fav> {
    return this.get<Fav>(this.path, id, this.favBody, this.queries);
  }

  public addFav(fav: NewFav): Observable<Fav> {
    return this.add<Fav>(this.path, this.favBody(fav), this.favBody).pipe(tap(_ => {
      this.getAllFavs().subscribe();
      if (this.userRole == 'AUTHENTICATED') {
        this.getAllClientFavs().subscribe();
      }
    }));
  }

  public updateFav(fav: Fav): Observable<Fav> {
    return this.update<Fav>(this.path, fav.id, this.favBody(fav), this.favBody).pipe(tap(_ => {
      this.getAllFavs().subscribe();
      if (this.userRole == 'AUTHENTICATED') {
        this.getAllClientFavs().subscribe();
      }
    }));
  }

  public deleteFav(id: number): Observable<Fav> {
    return this.delete<Fav>(this.path, this.favBody, id).pipe(tap(_ => {
      this.getAllFavs().subscribe();
      if (this.userRole == 'AUTHENTICATED') {
        this.getAllClientFavs().subscribe();
      }
    }));
  }

}
