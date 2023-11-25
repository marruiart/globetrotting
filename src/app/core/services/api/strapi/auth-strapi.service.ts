import { inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from '../api.service';
import { JwtService } from '../../auth/jwt.service';
import { AuthService } from '../../auth/auth.service';
import { lastValueFrom } from 'rxjs';
import { NewUser, UserCredentials, UserRegisterInfo } from '../../../models/globetrotting/user.interface';
import { UsersService } from '../users.service';
import { StrapiLoginPayload, StrapiLoginResponse, StrapiMe, StrapiRegisterPayload, StrapiRegisterResponse } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { AuthUser } from 'src/app/core/models/globetrotting/auth.interface';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';

export class AuthStrapiService extends AuthService {
  private userSvc = inject(UsersService);
  private authFacade = inject(AuthFacade);

  constructor(
    private apiSvc: ApiService,
    private jwtSvc: JwtService
  ) {
    super();
    this.init();
  }

  private init() {
    this.jwtSvc.loadToken().subscribe(_ => {
      this.authFacade.init();
    });
  }

  public login(credentials: UserCredentials): Observable<void> {
    let _credentials: StrapiLoginPayload = {
      identifier: credentials.username,
      password: credentials.password
    }
    return new Observable<void>(observer => {
      this.apiSvc.post<StrapiLoginResponse>("/api/auth/local", _credentials)
        .subscribe({
          next: async auth => {
            await lastValueFrom(this.jwtSvc.saveToken(auth.jwt))
              .catch(err => console.error(err));
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

  public register(registerInfo: UserRegisterInfo): Observable<void> {
    let _registerInfo: StrapiRegisterPayload = {
      username: registerInfo.username,
      email: registerInfo.email,
      password: registerInfo.password
    }
    return new Observable<void>(observer => {
      this.apiSvc.post<StrapiRegisterResponse>("/api/auth/local/register", _registerInfo)
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

            await lastValueFrom(this.userSvc.addUser(user))
              .catch(err => {
                observer.error(err)
              });
            observer.next();
            observer.complete();
          },
          error: err => {
            observer.error(err);
          }
        });
    });
  }

  public logout(): Observable<any> {
    return this.jwtSvc.destroyToken();
  }

  public me(): Observable<AuthUser> {
    return new Observable<AuthUser>(observer => {
      this.apiSvc.getMe<StrapiMe>("/api/users/me?populate=role").subscribe({
        next: (res: StrapiMe) => {
          let authUser: AuthUser = {
            user_id: res.id,
            role: res.role.type.toUpperCase()
          }
          observer.next(authUser);
        },
        error: err => {
          observer.error(err);
        }
      });
    })
  }

}
