import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
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
  private queries: { [query: string]: string } = {}

  private body: any = (user: User) => {
    return {
      data: {
        avatar: user.avatar ?? null,
        nickname: user.nickname,
        name: user.name,
        surname: user.surname,
        age: user.age ?? null,
        user_id: user.user_id,
      }
    }
  }

  constructor(
    private mapSvc: MappingService
  ) {
    super();
  }

  public getAllUsers(): Observable<User[]> {
    return this.getAll<User[]>(this.path, this.queries, this.mapSvc.mapUsers).pipe(tap(res => {
      this._users.next(res);
    }));
  }

  public getUser(id: number): Observable<User> {
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["populate"] = "avatar"
    return this.get<User>(this.path, id, this.mapSvc.mapUser, _queries);
  }

  public extendedMe(id: number): Observable<User | null> {
    if (id) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user_id]"] = `${id}`;
      _queries["populate"] = "avatar"
      return this.getAll<PaginatedData<any>>(this.path, _queries, this.mapSvc.mapPaginatedUsers)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let me = res.data[0];
            this._extendedMe.next(me);
            return me;
          } else {
            return null;
          }
        }))
    } else {
      return of(null);
    }
  }

  public addUser(user: User | NewUser, updateObs: boolean = true): Observable<User> {
    return this.add<User>(this.path, this.body(user), this.mapSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }));
  }

  public updateUser(user: User, updateObs: boolean = true): Observable<User> {
    return this.update<User>(this.path, user.id, this.body(user), this.mapSvc.mapUser).pipe(tap(_ => {
      if (updateObs) {
        this.getAllUsers().subscribe();
      }
    }));
  }

  public deleteUser(id: number): Observable<User> {
    return this.delete<User>(this.path, this.mapSvc.mapUser, id).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }));;
  }

}
