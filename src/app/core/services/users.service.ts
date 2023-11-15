import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { NewUser, User } from '../models/user.interface';
import { ApiService } from './api.service';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

let mapUser = (res: any) => {
  return {
    id: res.data.id,
    avatar: res.data.attributes.avatar ?? undefined,
    nickname: res.data.attributes.nickname,
    name: res.data.attributes.name,
    surname: res.data.attributes.surname,
    age: res.data.attributes.age,
    user_id: res.data.attributes.user_id?.data.id,
  }
}

let mapUsers = (res: any) => {
  return Array.from(res.data).reduce((prev: User[], userRes: any): User[] => {
    let _user: User = {
      id: userRes.id,
      avatar: userRes.attributes.avatar ?? undefined,
      nickname: userRes.attributes.nickname,
      name: userRes.attributes.name,
      surname: userRes.attributes.surname,
      age: userRes.attributes.age,
      user_id: userRes.attributes.user_id?.data.id,
    }
    prev.push(_user);
    return prev;
  }, []);
}

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

  public getAllUsers(): Observable<User[]> {
    return this.getAll<User[]>(this.path, this.queries, mapUsers).pipe(tap(res => {
      this._users.next(res);
    }));
  }

  public getUser(id: number): Observable<User> {
    return this.get<User>(this.path, id, mapUser, this.queries);
  }

  public addUser(user: User | NewUser): Observable<User> {
    return this.add<User>(this.path, this.body(user), mapUser).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }));
  }

  public updateUser(user: User): Observable<User> {
    return this.update<User>(this.path, user.id, this.body(user), mapUser).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }));
  }

  public deleteUser(id: number): Observable<User> {
    return this.delete<User>(this.path, mapUser, id).pipe(tap(_ => {
      this.getAllUsers().subscribe();
    }));;
  }

}
