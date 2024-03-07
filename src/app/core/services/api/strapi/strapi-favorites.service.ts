import { inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { FavoritesFacade } from 'src/app/core/+state/favorites/favorites.facade';
import { Fav, NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { Roles, StrapiEndpoints } from 'src/app/core/utilities/utilities';
import { DataService } from '../data.service';
import { MappingService } from '../mapping.service';


export class StrapiFavoritesService {
  private body = (fav: NewFav) => this.mapSvc.mapFavPayload(fav);

  private authFacade: AuthFacade = inject(AuthFacade);
  private favsFacade: FavoritesFacade = inject(FavoritesFacade);

  private _favs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public favs$: Observable<Fav[]> = this._favs.asObservable();
  private queries: { [query: string]: string } = {'populate': 'destination,client'}
  private userRole: string | null = null;
  private clientId: number | null = null;

  constructor(
    private dataSvc: DataService,
    private mapSvc: MappingService
  ) {
    this.authFacade.currentUser$.subscribe(user => {
      this.userRole = user?.role ?? null;
      this.clientId = user?.specific_id as number ?? null;
    })
  }

  public getAllFavs(): Observable<Fav[]> {
    return this.dataSvc.obtainAll<Fav[]>(StrapiEndpoints.FAVORITES, this.queries, this.mapSvc.mapFavs).pipe(tap(res => {
      this._favs.next(res);
    }));
  }

  public getAllClientFavs(): Observable<Fav[]> {
    if (this.clientId) {
      const _queries = { ...this.queries, "filters[client]": `${this.clientId}` };
      return this.dataSvc.obtainAll<Fav[]>(StrapiEndpoints.FAVORITES, _queries, this.mapSvc.mapFavs).pipe(tap(favs => {
        this.favsFacade.assignClientFavs(this.mapSvc.mapClientFavs(favs));
      }));
    } else {
      return of([]);
    }
  }

  public getFav(id: number): Observable<Fav> {
    return this.dataSvc.obtain<Fav>(StrapiEndpoints.FAVORITES, id, this.body, this.queries);
  }

  public addFav(newFav: NewFav): Observable<Fav> {
    return this.dataSvc.save<Fav>(StrapiEndpoints.FAVORITES, this.body(newFav), this.mapSvc.mapFav).pipe(tap(_ => {
      if (this.userRole=== Roles.AUTHENTICATED) {
        this.getAllClientFavs().subscribe();
      }
    }));
  }

  public updateFav(fav: Fav): Observable<Fav> {
    return this.dataSvc.update<Fav>(StrapiEndpoints.FAVORITES, fav.id, this.body(fav), this.body).pipe(tap(_ => {
      if (this.userRole=== Roles.AUTHENTICATED) {
        this.getAllClientFavs().subscribe();
      }
    }));
  }

  public deleteFav(id: number): Observable<Fav> {
    return this.dataSvc.delete<Fav>(StrapiEndpoints.FAVORITES, this.body, id, {}).pipe(tap(_ => {
      if (this.userRole=== Roles.AUTHENTICATED) {
        this.getAllClientFavs().subscribe();
      }
    }));
  }

}
