import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { NewExtUser, ExtUser, User } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { PaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { DataService } from './data.service';
import { ClientsFacade } from '../../+state/clients/clients.facade';
import { StrapiEndpoints } from '../../utilities/utilities';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  protected clientsFacade = inject(ClientsFacade);
  private _users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
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
    return this.dataSvc.obtainAll<User[]>(StrapiEndpoints.EXTENDED_USERS, _queries, this.mappingSvc.mapUsers).pipe(tap(res => {
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
    return this.dataSvc.obtain<User>(StrapiEndpoints.EXTENDED_USERS, id, this.mappingSvc.mapUser, this.queries)
      .pipe(catchError((err) => throwError(() => { 'No se ha podido obtener el usuario'; console.error(err) })));
  }

  /**
   * Get an agent from the extended user table. 
   * @param id The user id of the agent.
   * @returns The information of the extended user and user credentials of the agent.
   */
  public getAgentUser(id: number | string | null): Observable<User | null> {
    return id ? this.extendedMe(id) : of(null);
  }

  public getClientUser(id: number | string | string | null): Observable<User | null> {
    return id ? this.extendedMe(id) : of(null);
  }

  /** Returns the corresponding extended user with the id */
  public extendedMe(id: number | string | null): Observable<User | null> {
    if (id) {
      let _queries = { ...this.queries, "filters[user]": `${id}` };
      return this.dataSvc.obtainAll<PaginatedData<any>>(StrapiEndpoints.EXTENDED_USERS, _queries, this.mappingSvc.mapPaginatedUsers).pipe(map(res => {
        const users = res.data;
        return (users.length > 0) ? users[0] : null;
      }), catchError((err) => throwError(() => { 'No se ha podido obtener el usuario'; console.error(err) })))
    } else {
      return of(null);
    }
  }

  public addUser(user: User, updateObs: boolean = true): Observable<User> {
    const body = this.mappingSvc.mapNewExtUserPayload(user);
    return this.dataSvc.save<User>(StrapiEndpoints.EXTENDED_USERS, body, this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => throwError(() => { 'No se ha podido añadir al usuario'; console.error(err) })));
  }

  /**
   * 
   * @param user any value to be updated in a user
   * @param updateObs 
   * @returns 
   */
  public updateUser(user: any, updateObs: boolean = true): Observable<User> {
    const body = this.mappingSvc.mapNewExtUserPayload(user);
    return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.ext_id, body, this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => throwError(() => { 'No se ha podido modificar el usuario'; console.error(err) })));
  }

  public deleteUser(id: number | string): Observable<User> {
    const queries = {}
    return this.dataSvc.delete<User>(StrapiEndpoints.EXTENDED_USERS, this.mappingSvc.mapUser, id, {}).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }), catchError((err) => throwError(() => { 'No se ha podido eliminar al usuario'; console.error(err) })));
  }

}
