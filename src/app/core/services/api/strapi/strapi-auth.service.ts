import { inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from '../../auth/auth.service';
import { catchError, lastValueFrom, map, of, switchMap, tap, throwError } from 'rxjs';
import { AgentRegisterInfo, NewExtUser, ExtUser, UserRegisterInfo, Role, UserCredentialsOptions, UserCredentials, User, AgentUser, ClientUser } from '../../../models/globetrotting/user.interface';
import { UsersService } from '../users.service';
import { StrapiLoginPayload, StrapiLoginResponse, StrapiRegisterPayload, StrapiRegisterResponse, StrapiUserCredentials } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { AuthUser } from 'src/app/core/models/globetrotting/auth.interface';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { ClientService } from '../client.service';
import { AgentService } from '../agent.service';
import { Client, NewClient } from 'src/app/core/models/globetrotting/client.interface';
import { NewTravelAgent, TravelAgent } from 'src/app/core/models/globetrotting/agent.interface';
import { MappingService } from '../mapping.service';
import { JwtService } from '../../auth/jwt.service';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { environment } from 'src/environments/environment';
import { StrapiMeResponse } from 'src/app/core/models/strapi-interfaces/strapi-auth.interface';

export class StrapiAuthService extends AuthService {
  private userSvc = inject(UsersService);
  private dataSvc = inject(DataService);
  private mappingSvc = inject(MappingService);
  private clientSvc = inject(ClientService);
  private agentSvc = inject(AgentService);
  private authFacade = inject(AuthFacade);

  constructor(
    private jwtSvc:JwtService,
    private api:ApiService
  ) {
    super();
    this.init();
  }

  private init() {
    this.jwtSvc.loadToken().subscribe(_ => {
      this.authFacade.init();
    });
  }

  private getUrl(path: string, id: number | null = null) {
    return `${environment.strapiUrl}${path}${id ? `/${id}` : ''}`;
  }


  public login(credentials: UserCredentials): Observable<void> {
    return new Observable<void>(observer => {
      if (!(credentials.email || credentials.username) || !credentials.password) {
        observer.error('Error: The provided credentials are incorrect or incomplete.');
      }
      let _credentials: StrapiLoginPayload = {
        identifier: credentials.username || credentials.email!,
        password: credentials.password!
      }
      const url = this.getUrl("/api/auth/local");
      this.api.post<StrapiLoginResponse>(url, _credentials)
        .subscribe({
          next: async (auth: StrapiLoginResponse | null) => {
            if (auth) {
              await lastValueFrom(this.jwtSvc.saveToken(auth.jwt))
                .catch(err => console.error(err));
              observer.next();
              observer.complete();
            } else {
              observer.error('Error: Login failed.');
            }
          },
          error: err => {
            observer.error(err);
          }
        });
    });
  }

  public register(registerInfo: UserRegisterInfo | AgentRegisterInfo, isAgent: boolean = false): Observable<void> {
    const _agentInfo = (registerInfo as AgentRegisterInfo) ?? undefined;
    const nickname = _agentInfo.nickname ?? registerInfo.username;
    const _registerInfo: StrapiRegisterPayload = {
      username: registerInfo.username,
      email: registerInfo.email,
      password: registerInfo.password ?? ""
    }
    return new Observable<void>(observer => {
      const url = this.getUrl("/api/auth/local/register");
      this.api.post<StrapiRegisterResponse>(url, _registerInfo)
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
              const user: NewExtUser = {
                user_id: response.user.id,
                name: _agentInfo?.name,
                surname: _agentInfo?.surname,
                nickname: nickname
              }
              const newUser = await lastValueFrom(this.userSvc.addUser(user)
                .pipe(switchMap((newUser: ExtUser): Observable<ExtUser> => {
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

  public me(): Observable<User> {
    return this.dataSvc.obtainMe<StrapiMeResponse>("/api/users/me").pipe(
      switchMap((me: StrapiMeResponse) => {
        if (me) {
          return this.userSvc.extendedMe(me.id).pipe(
            switchMap((extUser: ExtUser | null) => {
              if (extUser) {
                switch (me.role.type.toUpperCase()) {
                  case 'AGENT':
                  case 'ADMIN':
                    return this.agentSvc.agentMe(me.id).pipe(
                      map((agent: TravelAgent | null) => {
                        if (agent) {
                          let user: AgentUser = {
                            role: agent.type,
                            user_id: me.id,
                            ext_id: extUser?.id,
                            specific_id: agent.id,
                            username: me.username,
                            email: me.email,
                            nickname: extUser?.nickname ?? me.username,
                            avatar: extUser?.avatar,
                            name: extUser?.name ?? '',
                            surname: extUser?.surname ?? '',
                            age: extUser?.age,
                            bookings: agent.bookings
                          }
                          return user;
                        } else {
                          throw new Error('Error: Specific user not found.');
                        }
                      }), catchError(error => throwError(() => error)));
                  case 'AUTHENTICATED':
                    return this.clientSvc.clientMe(me.id).pipe(
                      map((client: Client | null) => {
                        if (client) {
                          let user: ClientUser = {
                            role: client.type,
                            user_id: me.id,
                            ext_id: extUser?.id,
                            specific_id: client.id,
                            username: me.username,
                            email: me.email,
                            nickname: extUser?.nickname ?? me.username,
                            avatar: extUser?.avatar,
                            name: extUser?.name ?? '',
                            surname: extUser?.surname ?? '',
                            age: extUser?.age,
                            bookings: client.bookings,
                            favorites: client.favorites
                          }
                          return user;
                        } else {
                          throw new Error('Error: Specific user not found.');
                        }
                      }), catchError(error => throwError(() => error)));
                  default:
                    throw new Error('Error: User role is unknown.');
                }
              } else {
                throw new Error('Error: Extended user not found.');
              }
            }), catchError(error => throwError(() => error)))
        }
        else {
          throw new Error('Error: There is no authenticated user.');
        }
      }),
      catchError(error => throwError(() => error)));
  }

  public updateIdentifiers(user: StrapiUserCredentials): Observable<UserCredentialsOptions> {
    if (user.id) {
      return this.dataSvc.update("/api/users", user.id, user, this.mappingSvc.mapUserCredentials);
    }
    return throwError(() => "Usuario no actualizado: se desconoce el id del usuario");
  }

  public getUserIdentifiers(id: number): Observable<UserCredentialsOptions> {
    return this.dataSvc.obtain<UserCredentialsOptions>("/api/users", id, this.mappingSvc.mapUserCredentials, {});
  }

  public deleteUser(id: number): Observable<UserCredentialsOptions> {
    return this.dataSvc.delete<UserCredentialsOptions>("/api/users", this.mappingSvc.mapUserCredentials, id, {});
  }

}
