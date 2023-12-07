import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { Auth } from '../../models/globetrotting/auth.interface';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  private _jwt: string = "";

  constructor(
    private storageSvc: StorageService
  ) { }

  public saveToken(jwt: string): Observable<Auth> {
    return this.storageSvc.add(jwt).pipe(tap({
      next: res => {
        if (res) {
          this._jwt = res.jwt;
        }
      },
      error: err => {
        console.error(err);
      }
    }));
  }

  public loadToken(): Observable<Auth> {
    return this.storageSvc.get().pipe(tap({
      next: token => {
        if (token) {
          this._jwt = token.jwt;
        }
      },
      error: err => {
        console.error(err);
      }
    }));
  }

  public getToken(): string {
    return this._jwt;
  }

  public destroyToken() {
    this._jwt = "";
    return this.storageSvc.add(this._jwt);
  }

}
