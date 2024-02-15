import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { NewExtUser, ExtUser } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { PaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { DataService } from './data.service';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private path: string = "/api/extended-users";
  private _users: BehaviorSubject<ExtUser[]> = new BehaviorSubject<ExtUser[]>([]);
  public users$: Observable<ExtUser[]> = this._users.asObservable();
  private _extendedMe: BehaviorSubject<ExtUser | null> = new BehaviorSubject<ExtUser | null>(null);
  public extendedMe$: Observable<ExtUser | null> = this._extendedMe.asObservable();
  public jwt: string = "";
  private queries: { [query: string]: string } = {
    "populate": "user"
  }

  constructor(
    private dataSvc: DataService,
    private mapSvc: MappingService,
  ) {  }

  public getAllUsers(): Observable<ExtUser[]> {
    return this.dataSvc.obtainAll<ExtUser[]>(this.path, this.queries, this.mapSvc.mapExtUsers).pipe(tap(res => {
      this._users.next(res);
    }), catchError((err) => throwError(() => { 'No se han podido obtener los usuarios'; console.error(err) })));
  }

  public getUser(id: number | string): Observable<ExtUser> {
    return this.dataSvc.obtain<ExtUser>(this.path, id, this.mapSvc.mapExtUser, this.queries)
      .pipe(catchError((err) => throwError(() => { 'No se ha podido obtener el usuario'; console.error(err) })));
  }

  public getAgentUser(id: number | string | null): Observable<ExtUser | null> {
    return id ? this.extendedMe(id) : of(null);
  }

  public getClientUser(id: number | string | string | null): Observable<ExtUser | null> {
    return id ? this.extendedMe(id) : of(null);
  }

  /** Returns the corresponding extended user with the id */
  public extendedMe(id: number | string | null): Observable<ExtUser | null> {
    if (id) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user]"] = `${id}`;
      return this.dataSvc.obtainAll<PaginatedData<any>>(this.path, _queries, this.mapSvc.mapPaginatedUsers)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let me = res.data[0];
            this._extendedMe.next(me);
            return me;
          } else {
            return null;
          }
        }), catchError((err) => throwError(() => { 'No se ha podido obtener el usuario'; console.error(err) })))
    } else {
      return of(null);
    }
  }

  public addUser(user: NewExtUser, updateObs: boolean = true): Observable<ExtUser> {
    return this.dataSvc.save<ExtUser>(this.path, this.mapSvc.mapExtendedUserPayload(user), this.mapSvc.mapExtUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => throwError(() => { 'No se ha podido añadir al usuario'; console.error(err) })));
  }

  public updateUser(user: ExtUser, updateObs: boolean = true): Observable<ExtUser> {
    return this.dataSvc.update<ExtUser>(this.path, user.id, this.mapSvc.mapExtendedUserPayload(user), this.mapSvc.mapExtUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => throwError(() => { 'No se ha podido modificar el usuario'; console.error(err) })));
  }

  public deleteUser(id: number | string): Observable<ExtUser> {
    const queries = {}
    return this.dataSvc.delete<ExtUser>(this.path, this.mapSvc.mapExtUser, id, {}).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }), catchError((err) => throwError(() => { 'No se ha podido eliminar al usuario'; console.error(err) })));
  }

}
