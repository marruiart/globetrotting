import { inject } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { ClientFavDestination, Fav, NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { MappingService } from '../mapping.service';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { DataService } from '../data.service';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { FirebaseService } from '../../firebase/firebase.service';


export class FirebaseFavoritesService {
  private path: string = "/api/favorites";
  private body = (fav: NewFav) => this.mapSvc.mapFavPayload(fav);

  private firebaseSvc: FirebaseService = inject(FirebaseService);
  private _clientFavs: BehaviorSubject<ClientFavDestination[]> = new BehaviorSubject<ClientFavDestination[]>([]);
  public clientFavs$: Observable<ClientFavDestination[]> = this._clientFavs.asObservable();
  private user: User | null = null;
  private authFacade: AuthFacade = inject(AuthFacade);
  private _favs: BehaviorSubject<Fav[]> = new BehaviorSubject<Fav[]>([]);
  public favs$: Observable<Fav[]> = this._favs.asObservable();
  private queries: { [query: string]: string } = {}

  constructor(
    private dataSvc: DataService,
    private mapSvc: MappingService
  ) {
    this.authFacade.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  public getAllFavs(): Observable<Fav[]> {
    return this.dataSvc.obtainAll<Fav[]>(this.path, this.queries, this.mapSvc.mapFavs).pipe(tap(res => {
      this._favs.next(res);
    }));
  }

  public getAllClientFavs(): Observable<ClientFavDestination[]> {
    if (this.user?.role == 'AUTHENTICATED') {
      const id = this.user.user_id;
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[client]"] = `${id}`;
      return this.dataSvc.obtainAll<ClientFavDestination[]>(this.path, _queries, this.mapSvc.mapClientFavs).pipe(map(res => {
        this._clientFavs.next(res);
        return this._clientFavs.value;
      }));
    } else {
      return of([] as ClientFavDestination[]);
    }
  }

  public getFav(id: number): Observable<Fav> {
    return this.dataSvc.obtain<Fav>(this.path, id, this.body, this.queries);
  }

  public addFav(newFav: NewFav): Observable<Fav> {
    if (newFav.client_id && newFav.destination_id) {
      const fav: ClientFavDestination = { fav_id: this.firebaseSvc.generateId(), destination_id: newFav.destination_id };
      return this.dataSvc.updateObject<Fav>('//users', newFav.client_id, 'favorites', fav, this.mapSvc.mapFav);
    }
    throw new Error('Error: User id or destination id was not provided');
  }

  public updateFav(fav: Fav): Observable<Fav> {
    return this.dataSvc.update<Fav>(this.path, fav.id, this.body(fav), this.body);
  }

  public deleteFav(id: number): Observable<Fav> {
    let deletedFav: Fav | null = null;
    if (this.user && this.user.role == 'AUTHENTICATED') {
      const favs = this.user.favorites.reduce((prev: ClientFavDestination[], fav: ClientFavDestination) => {
        if (fav.fav_id != id) {
          prev.push(fav);
        } else {
          deletedFav = { id: fav.fav_id, destination_id: fav.destination_id };
        }
        return prev;
      }, [])
      if (deletedFav) {
        return this.dataSvc.update<Fav>('//users', this.user.user_id, { 'favorites': favs }, this.mapSvc.mapFav);
      }
      throw Error('Error: Favorite id was not found among current user favorites. Deletion was not possible.');
    }
    throw Error('Error: Current authenticated user is not a client. Delete favorite is not allowed.');
  }

}
