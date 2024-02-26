import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class DataService {

  public abstract obtainAll<T>(path: string, queries?: { [query: string]: string }, callback?: ((res: any) => T)): Observable<T>;

  public abstract obtain<T>(path: string, id: number | string, callback: ((res: any) => T), queries: { [query: string]: string }): Observable<T>;

  public abstract obtainMe<T>(path: string): Observable<T>;

  public abstract save<T>(path: string, body: any, callback: ((res: any) => T)): Observable<T>;

  public abstract update<T>(path: string, id: number | string, body: any, callback: ((res: any) => T)): Observable<T>;

  public abstract updateObject<T>(path: string, id: number | string, key: string, value: any, callback: ((res: any) => T)): Observable<T>;

  public abstract delete<T>(path: string, callback: ((res: any) => T), id: number | string, queries: { [query: string]: string }): Observable<T>;
}
