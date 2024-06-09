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


  /**
   * Retrieves all users with the provided queries.
   * @param queries Additional queries to filter the results.
   * @returns An observable of a list of users.
   */
  public getAllUsers(queries: { [query: string]: string } = {}): Observable<User[]> {
    let _queries = { ...this.queries, ...queries };
    return this.dataSvc.obtainAll<User[]>(StrapiEndpoints.EXTENDED_USERS, _queries, this.mappingSvc.mapUsers).pipe(tap(res => {
      this._users.next(res);
    }), catchError((err) => { throw new Error(err) }));
  }

  /**
   * Retrieves all users with the role of client.
   * @returns An observable of a list of client users.
   */
  public getAllClientsUsers(): Observable<User[]> {
    return this.getAllUsers().pipe(map(users => {
      const clients = users.filter(user => user.role === Roles.AUTHENTICATED);
      this.clientsFacade.saveClients(clients);
      return clients;
    }))
  }

    /**
   * Retrieves a specific user by ID.
   * @param id The ID of the user to retrieve.
   * @returns An observable of the user.
   */
  public getUser(id: number | string): Observable<User> {
    return this.dataSvc.obtain<User>(StrapiEndpoints.EXTENDED_USERS, id, this.mappingSvc.mapUser, this.queries)
      .pipe(catchError((err) => { throw new Error(err) }));
  }

  /**
   * Retrieves an agent from the extended user table.
   * @param id The user ID of the agent.
   * @returns The information of the extended user and user credentials of the agent.
   */
  public getAgentExtUser(id: number | string | null): Observable<User | null> {
    return id ? this.extendedMe(id) : of(null);
  }

    /**
   * Retrieves a client from the extended user table.
   * @param id The user ID of the client.
   * @returns The information of the extended user and user credentials of the client.
   */
  public getClientExtUser(id: number | string | string | null): Observable<User | null> {
    return id ? this.extendedMe(id) : of(null);
  }

  /**
   * Returns the corresponding extended user with the ID.
   * @param id The ID of the user.
   * @returns An observable of the extended user.
   */
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

  /**
   * Adds a new user.
   * @param user The new user data.
   * @param updateObs Indicates whether to update the observations.
   * @returns An observable of the added user.
   */
  public addUser(user: User, updateObs: boolean = true): Observable<User> {
    const body = this.mappingSvc.mapNewExtUserPayload(user);
    return this.dataSvc.save<User>(StrapiEndpoints.EXTENDED_USERS, body, this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => { throw new Error(err) }));
  }

  /**
   * Updates an existing user.
   * @param user The user data to update.
   * @param updateObs Indicates whether to update the observations.
   * @returns An observable of the updated user.
   */
  public updateUser(user: any, updateObs: boolean = true): Observable<User> {
    const body = this.mappingSvc.mapExtUserPayload(user);
    return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.ext_id, body, this.mappingSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError((err) => { throw new Error(err) }));
  }

    /**
   * Deletes a user by ID.
   * @param id The ID of the user to delete.
   * @returns An observable of the deleted user.
   */
  public deleteUser(id: number | string): Observable<User> {
    return this.dataSvc.delete<User>(StrapiEndpoints.EXTENDED_USERS, this.mappingSvc.mapUser, id, {}).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }), catchError((err) => { throw new Error(err) }));
  }

}
