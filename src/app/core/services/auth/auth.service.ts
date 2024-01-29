import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from '../api/api.service';
import { AgentRegisterInfo, UserCredentials, UserCredentialsOptions, UserRegisterInfo } from '../../models/globetrotting/user.interface';
import { DataService } from '../api/data.service';
import { environment } from 'src/environments/environment';
import { AuthUserOptions } from '../../models/globetrotting/auth.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {

  public abstract login(credentials: UserCredentials): Observable<any>;

  public abstract register(info: UserRegisterInfo | AgentRegisterInfo, isAgent?: boolean): Observable<any>;

  public abstract logout(): Observable<any>;

  public abstract me(): Observable<AuthUserOptions>;

  public abstract updateIdentifiers(user: any): Observable<UserCredentialsOptions>;

  public abstract getUserIdentifiers(id: number): Observable<UserCredentialsOptions>;

  public abstract deleteUser(id: number): Observable<UserCredentialsOptions>;

}
