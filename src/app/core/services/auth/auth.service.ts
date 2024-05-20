import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AgentRegisterInfo, AdminAgentOrClientUser, UserCredentials, UserCredentialsOptions, UserRegisterInfo } from '../../models/globetrotting/user.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {

  public abstract login(credentials: UserCredentials): Observable<any>;

  public abstract register(info: UserRegisterInfo | AgentRegisterInfo, isAgent?: boolean): Observable<any>;

  public abstract logout(): Observable<any>;

  public abstract me(): Observable<AdminAgentOrClientUser>;

  public abstract getRoles(): Observable<any>;

  public abstract updateIdentifiers(user: any): Observable<UserCredentialsOptions>;

  public abstract getUserIdentifiers(id: number | string): Observable<UserCredentialsOptions>;

  public abstract deleteUser(user_id: number | string, ext_id?: number | string, isAgent?: boolean): Observable<void>;

}
