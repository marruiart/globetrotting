import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fav } from '../../models/globetrotting/fav.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class FavoritesService {

  public abstract getAllFavs(): Observable<Fav[]>

  public abstract getAllClientFavs(): Observable<Fav[]>

  public abstract getFav<T>(id: T): Observable<Fav>

  public abstract addFav<T>(fav: T): Observable<Fav>

  public abstract updateFav<T>(fav: T): Observable<Fav>

  public abstract deleteFav<T>(id: T): Observable<Fav>

}
