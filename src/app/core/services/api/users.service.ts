import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { NewExtUser, ExtUser, User } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { PaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { DataService } from './data.service';
import { ClientsFacade } from '../../+state/clients/clients.facade';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  protected clientsFacade = inject(ClientsFacade);
  private path: string = "/api/extended-users";
  private _users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  private _extendedMe: BehaviorSubject<ExtUser | null> = new BehaviorSubject<ExtUser | null>(null);
  public jwt: string = "";
  private queries: { [query: string]: string } = {
    "populate": "user.role"
  }

  constructor(
    private dataSvc: DataService,
    protected mappingSvc: MappingService,
  ) { }
  

  public getAllUsers(queries: { [query: string]: string } = {}): Observable<User[]> {
    let _queries = { ...this.queries, ...queries };
    return this.dataSvc.obtainAll<User[]>(this.path, _queries, this.mappingSvc.mapUsers).pipe(tap(res => {
      this._users.next(res);
    }), catchError((err) => throwError(() => { 'No se han podido obtener los usuarios'; console.error(err) })));
  }

  public getAllClientsUsers(): Observable<User[]> {
    return this.getAllUsers().pipe(map(users => {
      const clients = users.filter(user => user.role === 'AUTHENTICATED');
      this.clientsFacade.saveClients(clients);
      return clients;
    }))
  }

  public getUser(id: number | string): Observable<User> {
    return this.dataSvc.obtain<User>(this.path, id, this.mappingSvc.mapUser, this.queries)
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
      let _queries = { ...this.queries, "filters[user]": `${id}` };
      return this.dataSvc.obtainAll<PaginatedData<any>>(this.path, _queries, this.mappingSvc.mapPaginatedUsers)
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

  public addUser(user: NewExtUser, updateObs: boolean = true): Observable<User> {
    return this.dataSvc.save<User>(this.path, this.mappingSvc.mapExtendedUserPayload(user), this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => throwError(() => { 'No se ha podido añadir al usuario'; console.error(err) })));
  }

  public updateUser(user: ExtUser, updateObs: boolean = true): Observable<User> {
    return this.dataSvc.update<User>(this.path, user.id, this.mappingSvc.mapExtendedUserPayload(user), this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => throwError(() => { 'No se ha podido modificar el usuario'; console.error(err) })));
  }

  public deleteUser(id: number | string): Observable<User> {
    const queries = {}
    return this.dataSvc.delete<User>(this.path, this.mappingSvc.mapUser, id, {}).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }), catchError((err) => throwError(() => { 'No se ha podido eliminar al usuario'; console.error(err) })));
  }

}
