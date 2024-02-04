import { Inject, Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { FirebaseService } from '../firebase/firebase.service';
import { LocationsApiService } from './data-api/locations-api.service';
import { CharactersApiService } from './data-api/characters-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class DataService {

  public abstract obtainAll<T>(path: string, queries: { [query: string]: string }, callback: ((res: any) => T)): Observable<T>;

  public abstract obtain<T>(path: string, id: number, callback: ((res: any) => T), queries: { [query: string]: string }): Observable<T>;

  public abstract obtainMe<T>(path: string): Observable<T>;

  public abstract save<T>(path: string, body: any, callback: ((res: any) => T)): Observable<T>;

  public abstract update<T>(path: string, id: number, body: any, callback: ((res: any) => T)): Observable<T>;

  public abstract delete<T>(path: string, callback: ((res: any) => T), id: number, queries: { [query: string]: string }): Observable<T>;
}
