import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from '../api.service';
import { JwtService } from './jwt.service';
import { AuthProvider } from './auth.provider';
import { lastValueFrom } from 'rxjs';
import { Auth } from '../../models/auth.interface';
import { NewUser } from '../../models/user.interface';
import { StrapiLoginPayload, StrapiRegisterPayload, StrapiRegisterResponse } from '../../models/strapi.interfaces';
import { UserRegisterInfo } from '../../models/user-register-info.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthStrapiService extends AuthProvider {

  constructor(
    private apiSvc: ApiService,
    private jwtSvc: JwtService,
  ) {
    super();
    this.init();
  }

  private init() {
    this.jwtSvc.loadToken().subscribe(_ => {
      this._isLogged.next(true);
    });
  }

  public login(credentials: StrapiLoginPayload): Observable<void> {
    const body: any = {
      "identifier": credentials.identifier,
      "password": credentials.password
    }
    return new Observable<void>(observer => {
      this.apiSvc.post<Auth>("/api/auth/local", body)
        .subscribe({
          next: async auth => {
            await lastValueFrom(this.jwtSvc.saveToken(auth.jwt))
              .catch(err => {
                observer.error(err);
              });
            this._isLogged.next(true);
            observer.next();
            observer.complete();
          },
          error: err => {
            observer.error(err);
          }
        });
    });
  }

  public register(info: UserRegisterInfo): Observable<void> {
    const body: StrapiRegisterPayload = {
      "username": info.username,
      "email": info.email,
      "password": info.password
    }

    return new Observable<void>(observer => {
      this.apiSvc.post<StrapiRegisterResponse>("/api/auth/local/register", body)
        .subscribe({
          next: async response => {
            // Save token in local storage
            await lastValueFrom(this.jwtSvc.saveToken(response.jwt))
              .catch(err => {
                observer.error(err)
              });
            const nickname = response.user.username.slice(0, response.user.username.indexOf("@"));
            const user: NewUser = {
              "user_id": response.user.id,
              "nickname": nickname
            }
            this._isLogged.next(true);

            observer.next();
            observer.complete();
          },
          error: err => {
            observer.error(err);
          }
        });
    });
  }

  public logout(): void {
    lastValueFrom(this.jwtSvc.destroyToken())
      .then(_ => {
        this._isLogged.next(false);
      })
      .catch(err => {
        console.error(err);
      });
  }

  public me<T>(): Observable<T> {
    throw new Error('Method not implemented.');
  }

}
