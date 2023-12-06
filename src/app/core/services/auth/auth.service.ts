import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService extends ApiService {

  protected _isLogged = new BehaviorSubject<boolean>(false);
  public isLogged$ = this._isLogged.asObservable();

  public abstract login(credentials: Object): Observable<any>;

  public abstract register(info: Object, isAgent?: boolean): Observable<any>;

  public abstract logout(): Observable<any>;

  public abstract me(): Observable<any>;

}
