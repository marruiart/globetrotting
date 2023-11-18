import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { NewUser, User } from '../../models/globetrotting/user.interface';
import { ApiService } from './api.service';
import { MapService } from './map.service';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

@Injectable({
  providedIn: 'root'
})
export class UsersService extends ApiService {
  private path: string = "/api/extended-users";
  private _users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this._users.asObservable();
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
    private mapSvc: MapService
  ) {
    super();
  }

  public getAllUsers(): Observable<User[]> {
    return this.getAll<User[]>(this.path, this.queries, this.mapSvc.mapUsers).pipe(tap(res => {
      this._users.next(res);
    }));
  }

  public getUser(id: number): Observable<User> {
    return this.get<User>(this.path, id, this.mapSvc.mapUser, this.queries);
  }

  public addUser(user: User | NewUser): Observable<User> {
    return this.add<User>(this.path, this.body(user), this.mapSvc.mapUser).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }));
  }

  public updateUser(user: User): Observable<User> {
    return this.update<User>(this.path, user.id, this.body(user), this.mapSvc.mapUser).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }));
  }

  public deleteUser(id: number): Observable<User> {
    return this.delete<User>(this.path, this.mapSvc.mapUser, id).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }));;
  }

}
