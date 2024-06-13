import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { ClientsFacade } from '../../+state/clients/clients.facade';
import { PaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { User } from '../../models/globetrotting/user.interface';
import { Roles, StrapiEndpoints } from '../../utilities/utilities';
import { DataService } from './data.service';
import { MappingService } from './mapping.service';

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
    protected dataSvc: DataService,
    protected mappingSvc: MappingService,
  ) { }


  public getAllUsers(queries: { [query: string]: string } = {}): Observable<User[]> {
    let _queries = { ...this.queries, ...queries };
    return this.dataSvc.obtainAll<User[]>(StrapiEndpoints.EXTENDED_USERS, _queries, this.mappingSvc.mapUsers).pipe(tap(res => {
      this._users.next(res);
    }), catchError((err) => { throw new Error(err) }));
  }

  public getAllClientsUsers(): Observable<User[]> {
    return this.getAllUsers().pipe(map(users => {
      const clients = users.filter(user => user.role === Roles.AUTHENTICATED);
      this.clientsFacade.saveClients(clients);
      return clients;
    }))
  }

  public getUser(id: number | string): Observable<User> {
    return this.dataSvc.obtain<User>(StrapiEndpoints.EXTENDED_USERS, id, this.mappingSvc.mapUser, this.queries)
      .pipe(catchError((err) => { throw new Error(err) }));
  }

  /**
   * Get an agent from the extended user table. 
   * @param id The user id of the agent.
   * @returns The information of the extended user and user credentials of the agent.
   */
  public getAgentExtUser(id: number | string | null): Observable<User | null> {
    return id ? this.extendedMe(id) : of(null);
  }

  public getClientExtUser(id: number | string | string | null): Observable<User | null> {
    return id ? this.extendedMe(id) : of(null);
  }

  /** Returns the corresponding extended user with the id */
  public extendedMe(id: number | string | null): Observable<User | null> {
    if (id) {
      let _queries = { ...this.queries, "filters[user]": `${id}` };
      return this.dataSvc.obtainAll<PaginatedData<any>>(StrapiEndpoints.EXTENDED_USERS, _queries, this.mappingSvc.mapPaginatedUsers).pipe(map(res => {
        const users = res.data;
        return (users.length > 0) ? users[0] : null;
      }), catchError((err) => { throw new Error(err) }));
    } else {
      return of(null);
    }
  }

  /**Currently only used from strapi */
  public addUser(user: User, updateObs: boolean = true): Observable<User> {
    const body = this.mappingSvc.mapNewExtUserPayload(user);
    return this.dataSvc.save<User>(StrapiEndpoints.EXTENDED_USERS, body, this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => { throw new Error(err) }));
  }

  /**
   * 
   * @param user any value to be updated in a user
   * @param updateObs 
   * @returns 
   */
  public updateUser(user: any, updateObs: boolean = true): Observable<User> {
    const body = this.mappingSvc.mapExtUserPayload(user);
    return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.ext_id, body, this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => { throw new Error(err) }));
  }


  public updateUserAvatar(uid: string, avatar: string): Observable<User> {
    const body = {
      user_id: uid,
      avatar: avatar
    }
    return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, uid, body, this.mappingSvc.mapUser).pipe(tap(_ => {

    }), catchError((err) => { throw new Error(err) }));
  }


  public deleteUser(id: number | string): Observable<User> {
    return this.dataSvc.delete<User>(StrapiEndpoints.EXTENDED_USERS, this.mappingSvc.mapUser, id, {}).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }), catchError((err) => { throw new Error(err) }));
  }

}
