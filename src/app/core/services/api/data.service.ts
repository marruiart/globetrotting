import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class DataService {

  public abstract obtainAll<T>(path: string, queries: { [query: string]: string }, callback: (<S>(res: S) => T)): Observable<T>;

  public abstract obtain<T>(path: string, id: number, callback: ((res: T) => T), queries: { [query: string]: string }): Observable<T>;

  public abstract obtainMe<T>(path: string): Observable<T>;

  public abstract send<T>(path: string, body: any, callback: ((res: T) => T)): Observable<T>;

  public abstract update<T>(path: string, id: number, body: any, callback: ((res: T) => T)): Observable<T>;

  public abstract delete<T>(path: string, callback: ((res: T) => T), id: number, queries: { [query: string]: string }): Observable<T>;
}
