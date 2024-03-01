import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientFavDestination, Fav } from '../../models/globetrotting/fav.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class FavoritesService {

  public abstract getAllFavs(): Observable<Fav[]>

  public abstract getAllClientFavs(): Observable<ClientFavDestination[]>

  public abstract getFav<T>(id: T): Observable<Fav>

  public abstract addFav<T>(newFav: T): Observable<Fav>

  public abstract updateFav<T>(fav: T): Observable<Fav>

  public abstract deleteFav<T>(id: T): Observable<Fav>

}
