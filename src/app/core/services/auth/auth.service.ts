import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AgentRegisterInfo, User, UserCredentials, UserCredentialsOptions, UserRegisterInfo } from '../../models/globetrotting/user.interface';
import { AuthUser } from '../../models/globetrotting/auth.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {

  public abstract login(credentials: UserCredentials): Observable<any>;

  public abstract register(info: UserRegisterInfo | AgentRegisterInfo, isAgent?: boolean): Observable<any>;

  public abstract logout(): Observable<any>;

  public abstract me(): Observable<User>;

  public abstract updateIdentifiers(user: any): Observable<UserCredentialsOptions>;

  public abstract getUserIdentifiers(id: number): Observable<UserCredentialsOptions>;

  public abstract deleteUser(id: number): Observable<UserCredentialsOptions>;

}
