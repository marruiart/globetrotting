import { inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from '../../auth/auth.service';
import { catchError, lastValueFrom, of, switchMap, tap } from 'rxjs';
import { AgentRegisterInfo, NewUser, User, UserCredentials, UserRegisterInfo } from '../../../models/globetrotting/user.interface';
import { UsersService } from '../users.service';
import { StrapiLoginPayload, StrapiLoginResponse, StrapiMe, StrapiRegisterPayload, StrapiRegisterResponse } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { AuthUser } from 'src/app/core/models/globetrotting/auth.interface';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { ClientService } from '../client.service';
import { AgentService } from '../agent.service';
import { Client, NewClient } from 'src/app/core/models/globetrotting/client.interface';
import { NewTravelAgent, TravelAgent } from 'src/app/core/models/globetrotting/agent.interface';

export class AuthStrapiService extends AuthService {
  private userSvc = inject(UsersService);
  private clientSvc = inject(ClientService);
  private agentSvc = inject(AgentService);
  private authFacade = inject(AuthFacade);

  constructor() {
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
      this.post<StrapiLoginResponse>("/api/auth/local", _credentials)
        .subscribe({
          next: async (auth: StrapiLoginResponse | null) => {
            if (auth) {
              await lastValueFrom(this.jwtSvc.saveToken(auth.jwt))
                .catch(err => console.error(err));
              this._isLogged.next(true);
              observer.next();
              observer.complete();
            } else {
              observer.error('Error en la autenticación');
            }
          },
          error: err => {
            observer.error(err);
          }
        });
    });
  }

  public register(registerInfo: UserRegisterInfo | AgentRegisterInfo, isAgent: boolean = false): Observable<void> {
    let nickname = registerInfo.nickname ?? registerInfo.username.slice(0, registerInfo.username.indexOf("@"));
    let _registerInfo: StrapiRegisterPayload = {
      username: registerInfo.email,
      email: registerInfo.email,
      password: registerInfo.password
    }
    return new Observable<void>(observer => {
      this.post<StrapiRegisterResponse>("/api/auth/local/register", _registerInfo)
        .subscribe({
          next: async (response: StrapiRegisterResponse | null) => {
            if (response) {
              console.info(`Usuario creado con id ${response.user.id}`);
              if (!isAgent) {
                // Save token in local storage
                await lastValueFrom(this.jwtSvc.saveToken(response.jwt))
                  .catch(err => {
                    observer.error(err)
                  });
              }

              // Create related extended user
              const user: NewUser = {
                user_id: response.user.id,
                name: registerInfo.name,
                surname: registerInfo.surname,
                nickname: nickname
              }
              this._isLogged.next(true);
              const newUser = await lastValueFrom(this.userSvc.addUser(user)
                .pipe(switchMap((newUser: User): Observable<User> => {
                  if (isAgent) {
                    let _user: any = {
                      id: newUser.id,
                      role: 3 // agent
                    }
                    return this.userSvc.updateUser(_user)
                      .pipe(tap(_ => {
                        console.info(`Usuario con id ${newUser.user_id} asignado al rol de agente correctamente`);
                      }),
                        catchError(err => {
                          console.info("Rol del agente no asignado correctamente");
                          console.error(err);
                          return of(newUser);
                        }))
                  } else {
                    return of(newUser);
                  }
                })));
              (newUser) ?
                console.info(`Extended user creado con id ${newUser?.id} asociado a ${newUser.user_id}`)
                : "Extended user no creado";

              if (isAgent) {
                // Create related agent
                const agent: NewTravelAgent = {
                  type: 'AGENT',
                  user_id: response.user.id,
                  bookings: []
                }
                const newAgent = await lastValueFrom(this.agentSvc.addAgent(agent))
                  .catch(err => observer.error(err));
                (newAgent) ?
                  console.info(`Agente creado con id ${newAgent?.id} asociado a ${newAgent.user_id}`)
                  : "Agente no creado";
              } else {
                // Create related client
                const client: NewClient = {
                  type: 'AUTHENTICATED',
                  user_id: response.user.id,
                  bookings: [],
                  favorites: []
                }
                const newClient = await lastValueFrom(this.clientSvc.addClient(client))
                  .catch(err => observer.error(err));
                (newClient) ?
                  console.info(`Cliente creado con id ${newClient?.id} asociado a ${newClient?.user_id}`)
                  : "Cliente no creado";
              }
              observer.next();
              observer.complete();
            } else {
              observer.error('Error al registrar al usuario');
            }
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
      this.getMe<StrapiMe>("/api/users/me?populate=role").subscribe({
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
