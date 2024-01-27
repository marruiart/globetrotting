import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from '../api/api.service';
import { UserCredentials } from '../../models/globetrotting/user.interface';
import { DataService } from '../api/data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {

  public abstract login(credentials: Object): Observable<any>;

  public abstract register(info: Object, isAgent?: boolean): Observable<any>;

  public abstract logout(): Observable<any>;

  public abstract me(): Observable<any>;

  public abstract updateIdentifiers(user: any): Observable<UserCredentials>;

  public abstract getUserIdentifiers(id: number): Observable<UserCredentials>;

  public abstract deleteUser(id: number): Observable<UserCredentials>;

}
