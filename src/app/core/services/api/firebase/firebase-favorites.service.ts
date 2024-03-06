import { inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { ClientFavDestination, Fav, NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { AdminAgentOrClientUser } from 'src/app/core/models/globetrotting/user.interface';
import { Roles, StrapiEndpoints } from 'src/app/core/utilities/utilities';
import { FirebaseService } from '../../firebase/firebase.service';
import { DataService } from '../data.service';
import { MappingService } from '../mapping.service';


export class FirebaseFavoritesService {
  private body = (fav: NewFav) => this.mapSvc.mapFavPayload(fav);

  private firebaseSvc = inject(FirebaseService);
  private user: AdminAgentOrClientUser | null = null;
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
    return this.dataSvc.obtainAll<Fav[]>(StrapiEndpoints.FAVORITES, this.queries, this.mapSvc.mapFavs).pipe(tap(res => {
      this._favs.next(res);
    }));
  }

  public getAllClientFavs(): Observable<ClientFavDestination[]> {
    throw new Error('Method not implemented');
  }

  public getFav(id: number): Observable<Fav> {
    return this.dataSvc.obtain<Fav>(StrapiEndpoints.FAVORITES, id, this.body, this.queries);
  }

  public addFav(newFav: NewFav): Observable<Fav> {
    if (newFav.client_id && newFav.destination_id) {
      const fav: ClientFavDestination = { fav_id: this.firebaseSvc.generateId(), destination_id: newFav.destination_id };
      return this.dataSvc.updateArray<Fav>(StrapiEndpoints.EXTENDED_USERS, newFav.client_id, 'favorites', fav, this.mapSvc.mapFav);
    }
    throw new Error('Error: User id or destination id was not provided');
  }

  public updateFav(fav: Fav): Observable<Fav> {
    return this.dataSvc.update<Fav>(StrapiEndpoints.FAVORITES, fav.id, this.body(fav), this.body);
  }

  public deleteFav(id: number): Observable<Fav> {
    let deletedFav: Fav | null = null;
    if (this.user && this.user.role === Roles.AUTHENTICATED) {
      const favs = this.user.favorites.reduce((prev: ClientFavDestination[], fav: ClientFavDestination) => {
        if (fav.fav_id != id) {
          prev.push(fav);
        } else {
          deletedFav = { id: fav.fav_id, destination_id: fav.destination_id };
        }
        return prev;
      }, [])
      if (deletedFav) {
        return this.dataSvc.update<Fav>(StrapiEndpoints.EXTENDED_USERS, this.user.user_id, { 'favorites': favs }, this.mapSvc.mapFav);
      }
      throw Error('Error: Favorite id was not found among current user favorites. Deletion was not possible.');
    }
    throw Error('Error: Current authenticated user is not a client. Delete favorite is not allowed.');
  }

}
