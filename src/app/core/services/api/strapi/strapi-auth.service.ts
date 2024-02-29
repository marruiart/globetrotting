import { inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from '../../auth/auth.service';
import { catchError, lastValueFrom, map, switchMap, throwError } from 'rxjs';
import { AgentRegisterInfo, UserRegisterInfo, UserCredentialsOptions, UserCredentials, AdminAgentOrClientUser, AgentUser, ClientUser, User, AdminUser } from '../../../models/globetrotting/user.interface';
import { UsersService } from '../users.service';
import { StrapiLoginPayload, StrapiLoginResponse, StrapiRegisterPayload, StrapiRegisterResponse, StrapiRolesResponse } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
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
import { Roles, StrapiEndpoints } from 'src/app/core/utilities/utilities';

export class StrapiAuthService extends AuthService {
  private userSvc = inject(UsersService);
  private dataSvc = inject(DataService);
  private mappingSvc = inject(MappingService);
  private clientSvc = inject(ClientService);
  private agentSvc = inject(AgentService);
  private authFacade = inject(AuthFacade);

  constructor(
    private jwtSvc: JwtService,
    private api: ApiService
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

  public getRoles(): Observable<StrapiRolesResponse> {
    return this.dataSvc.obtainAll<StrapiRolesResponse>(StrapiEndpoints.ROLES)
  }

  private saveToken(response: StrapiLoginResponse) {
    return lastValueFrom(this.jwtSvc.saveToken(response.jwt)).catch(err => { throw Error(err) });
  }

  private rollback(user_id: number, ext_id?: number) {
    console.info('Rollback: ', user_id, ext_id);
    // TODO
  }

  private createExtUser(_agentInfo: AgentRegisterInfo, _registerInfo: StrapiRegisterPayload, isAgent: boolean, userId: number, nickname: string) {
    let _user: User = {
      ..._registerInfo,
      role: isAgent ? Roles.AGENT : Roles.AUTHENTICATED,
      user_id: userId,
      nickname: nickname
    }
    if (isAgent) {
      _user = this.includeAgentName(_user, _agentInfo);
    } return lastValueFrom(this.userSvc.addUser(_user));
  }

  private async createAgent(user: User): Promise<TravelAgent> {
    const agent: NewTravelAgent = {
      user_id: user.user_id,
      bookings: []
    }
    return lastValueFrom(this.agentSvc.addAgent(agent));
  }

  private async createClient(user: User): Promise<Client> {
    const client: NewClient = {
      type: 'AUTHENTICATED',
      user_id: user.user_id,
      bookings: [],
      favorites: []
    }
    return lastValueFrom(this.clientSvc.addClient(client)).catch(err => { throw new Error(err) });
  }

  private async updateAgentRole(userId: number) {
    const response = await lastValueFrom(this.getRoles());
    const roleId: number = response.roles.filter(role => role.type.toUpperCase() === Roles.AGENT)[0].id;
    const url = this.getUrl(StrapiEndpoints.USER_PERMISSIONS, userId);
    await lastValueFrom(this.api.put<StrapiRegisterResponse>(url, { 'role': roleId }));
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
      const url = this.getUrl(StrapiEndpoints.LOGIN);
      this.api.post<StrapiLoginResponse>(url, _credentials)
        .subscribe({
          next: async (auth: StrapiLoginResponse | null) => {
            if (auth) {
              await lastValueFrom(this.jwtSvc.saveToken(auth.jwt)).catch(err => console.error(err));
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
      password: registerInfo.password ?? ''
    }
    return new Observable<void>(observer => {
      const url = this.getUrl(StrapiEndpoints.REGISTER);
      this.api.post<StrapiRegisterResponse>(url, _registerInfo).subscribe({
        next: async (response: StrapiRegisterResponse | null) => {
          if (response) {
            const userId = response.user.id;
            console.info(`User created with id ${userId}`);
            (isAgent) ? this.updateAgentRole(userId) : await this.saveToken(response).catch(err => observer.error(err));
            const extUser = await this.createExtUser(_agentInfo, _registerInfo, isAgent, userId, nickname).catch(err => observer.error(err));
            if (extUser) {
              console.info(`Created extended user with id ${extUser?.ext_id} related to user ${extUser?.user_id}`);
              let specificUser;
              try {
                specificUser = (isAgent) ? await this.createAgent(extUser) : await this.createClient(extUser);
                console.info(`Created specific user with id ${specificUser?.id} related to user ${specificUser?.user_id}`);
              } catch (error) {
                this.rollback(userId, extUser.ext_id as number);
                observer.error(error);
              }
            } else {
              this.rollback(userId);
              observer.error('ERROR: Unknown error at creating extended user. Extended user not created.');
            }
            observer.next();
            observer.complete();
          } else {
            observer.error('ERROR: Unknown error at registering the user.');
          }
        },
        error: err => {
          observer.error(err);
        }
      });
    });
  }

  private includeAgentName(_user: User, _agentInfo: AgentRegisterInfo) {
    return {
      ..._user, ...{
        name: _agentInfo?.name,
        surname: _agentInfo?.surname,
      }
    }
  }

  public logout(): Observable<any> {
    return this.jwtSvc.destroyToken();
  }

  public me(): Observable<AdminAgentOrClientUser> {
    return this.dataSvc.obtainMe<StrapiMeResponse>(StrapiEndpoints.ME).pipe(
      switchMap((me: StrapiMeResponse) => {
        if (me) {
          return this.userSvc.extendedMe(me.id).pipe(
            switchMap((extUser: User | null) => {
              if (extUser) {
                const role = me.role.type.toUpperCase();
                switch (role) {
                  case 'AGENT':
                  case 'ADMIN':
                    return this.agentSvc.agentMe(me.id).pipe(
                      map((agent: TravelAgent | null) => {
                        if (agent) {
                          let user: AgentUser | AdminUser = {
                            role: role,
                            user_id: me.id,
                            ext_id: extUser?.ext_id,
                            specific_id: agent.id,
                            username: me.username,
                            email: me.email,
                            nickname: extUser?.nickname ?? me.username,
                            avatar: extUser?.avatar,
                            name: extUser?.name ?? '',
                            surname: extUser?.surname ?? '',
                            age: extUser?.age,
                          }
                          return user;
                        } else {
                          throw new Error('Error: Specific user not found.');
                        }
                      }), catchError(error => { throw new Error(error) }));
                  case Roles.AUTHENTICATED:
                    return this.clientSvc.clientMe(me.id).pipe(
                      map((client: Client | null) => {
                        if (client) {
                          let user: ClientUser = {
                            role: client.type,
                            user_id: me.id,
                            ext_id: extUser?.ext_id,
                            specific_id: client.id,
                            username: me.username,
                            email: me.email,
                            nickname: extUser?.nickname ?? me.username,
                            avatar: extUser?.avatar,
                            name: extUser?.name ?? '',
                            surname: extUser?.surname ?? '',
                            age: extUser?.age,
                            favorites: client.favorites
                          }
                          return user;
                        } else {
                          throw new Error('Error: Specific user not found.');
                        }
                      }), catchError(error => { throw new Error(error) }));
                  default:
                    throw new Error('Error: User role is unknown.');
                }
              } else {
                throw new Error('Error: Extended user not found.');
              }
            }), catchError(error => { throw new Error(error) }))
        } else {
          throw new Error('Error: There is no authenticated user.');
        }
      }),
      catchError(error => { throw new Error(error) }));
  }

  public updateIdentifiers(user: any): Observable<UserCredentialsOptions> {
    if (user.user_id) {
      const body = this.mappingSvc.mapUserCredentialsPayload(user);
      return this.dataSvc.update(StrapiEndpoints.USER_PERMISSIONS, user.user_id, body, this.mappingSvc.mapUserCredentials);
    }
    return throwError(() => "Usuario no actualizado: se desconoce el id del usuario");
  }

  public getUserIdentifiers(id: number): Observable<UserCredentialsOptions> {
    return this.dataSvc.obtain<UserCredentialsOptions>(StrapiEndpoints.USER_PERMISSIONS, id, this.mappingSvc.mapUserCredentials, { "populate": "role" });
  }

  public deleteUser(id: number): Observable<UserCredentialsOptions> {
    return this.dataSvc.delete<UserCredentialsOptions>(StrapiEndpoints.USER_PERMISSIONS, this.mappingSvc.mapUserCredentials, id, {});
  }

}
