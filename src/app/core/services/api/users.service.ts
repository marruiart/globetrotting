import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { NewUser, User } from '../../models/globetrotting/user.interface';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { PaginatedData } from '../../models/globetrotting/pagination-data.interface';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

@Injectable({
  providedIn: 'root'
})
export class UsersService extends ApiService {
  private path: string = "/api/extended-users";
  private _users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this._users.asObservable();
  private _extendedMe: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public extendedMe$: Observable<User | null> = this._extendedMe.asObservable();
  public jwt: string = "";
  private queries: { [query: string]: string } = {
    "populate": "avatar,user"
  }

  constructor(
    private mapSvc: MappingService
  ) {
    super();
  }

  public getAllUsers(): Observable<User[]> {
    return this.getAll<User[]>(this.path, this.queries, this.mapSvc.mapUsers).pipe(tap(res => {
      this._users.next(res);
    }), catchError(() => throwError(() => 'No se han podido obtener los usuarios')));
  }

  public getUser(id: number): Observable<User> {
    return this.get<User>(this.path, id, this.mapSvc.mapUser, this.queries)
      .pipe(catchError(() => throwError(() => 'No se ha podido obtener el usuario')));
  }

  public getAgentUser(id: number | null): Observable<User | null> {
    return this.extendedMe(id);
  }

  public getClientUser(id: number | null): Observable<User | null> {
    return this.extendedMe(id);
  }

  public extendedMe(id: number | null): Observable<User | null> {
    if (id) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user]"] = `${id}`;
      return this.getAll<PaginatedData<any>>(this.path, _queries, this.mapSvc.mapPaginatedUsers)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let me = res.data[0];
            this._extendedMe.next(me);
            return me;
          } else {
            return null;
          }
        }), catchError(() => throwError(() => 'No se ha podido obtener el usuario')))
    } else {
      return of(null);
    }
  }

  public addUser(user: NewUser, updateObs: boolean = true): Observable<User> {
    return this.add<User>(this.path, this.mapSvc.mapExtendedUserPayload(user), this.mapSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError(() => throwError(() => 'No se ha podido añadir al usuario')));
  }

  public updateUser(user: User, updateObs: boolean = true): Observable<User> {
    return this.update<User>(this.path, user.id, this.mapSvc.mapExtendedUserPayload(user), this.mapSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }), catchError(() => throwError(() => 'No se ha podido modificar el usuario')));
  }

  public deleteUser(id: number): Observable<User> {
    return this.delete<User>(this.path, this.mapSvc.mapUser, id).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }), catchError(() => throwError(() => 'No se ha podido eliminar al usuario')));
  }

}
