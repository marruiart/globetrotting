import { Injectable } from '@angular/core';
import { AuthFacade } from '../libs/auth/auth.facade';
import { BehaviorSubject, catchError, map, of, switchMap, zip } from 'rxjs';
import { CustomTranslateService } from './custom-translate.service';
import { UserFacade } from '../libs/load-user/load-user.facade';

interface CustomMenu {
  public: any[],
  client: any[],
  agent: any[],
  admin: any[]
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menu = new BehaviorSubject<any>({});
  public menu$ = this._menu.asObservable();

  private homeItem = {
    label: 'Inicio',
    icon: 'custom-icon home-outline',
    routerLink: ['/home']
  }

  private destinationsItem =
    {
      label: 'Destinos',
      icon: 'custom-icon paper-plane-outline',
      routerLink: ['/destinations']
    }

  private managingItem = {
    label: 'Gestión',
    icon: 'custom-icon briefcase-outline',
    items: [
      {
        label: 'Gestionar reservas',
        icon: 'custom-icon calendar-outline',
        routerLink: ['/admin/bookings']
      },
      {
        label: 'Gestionar destinos',
        icon: 'custom-icon trail-sign-outline',
        routerLink: ['/admin/destinations-management']
      }
    ],
    styleClass: "login-btn"
  }

  private adminManagingItem = {
    label: this.managingItem.label,
    icon: this.managingItem.icon,
    items: [
      this.managingItem.items[0],
      this.managingItem.items[1],
      {
        label: 'Gestionar agentes',
        icon: 'custom-icon people-outline',
        routerLink: ['/admin/agents-management']
      }
    ],
    styleClass: this.managingItem.styleClass
  }

  private loginItem = {
    label: 'Iniciar sesión',
    icon: 'custom-icon person-outline',
    routerLink: ['/login'],
    styleClass: "login-btn"
  }

  private userProfileItem = {
    label: 'Usuario',
    icon: 'custom-icon person-outline',
    items: [
      {
        label: 'Mi perfil',
        icon: 'custom-icon person-circle-outline',
        routerLink: ['/profile']
      },
      {
        label: 'Salir',
        icon: 'custom-icon log-in-outline',
        command: () => {
          this.authFacade.logout()
        }
      }
    ],
    styleClass: "login-btn"
  }

  private clientProfileItem = {
    label: this.userProfileItem.label,
    icon: this.userProfileItem.icon,
    items: [
      this.userProfileItem.items[0],
      {
        label: 'Mis reservas',
        icon: 'custom-icon calendar-outline',
        routerLink: ['/bookings']
      },
      this.userProfileItem.items[1]
    ],
    styleClass: this.userProfileItem.styleClass
  }

  constructor(
    private authFacade: AuthFacade,
    private userFacade: UserFacade,
    private translate: CustomTranslateService
  ) {
    this.translate.language$.pipe(
      switchMap((_: string) => this.userFacade.nickname$.pipe(
        switchMap(nickname => this.selectMenu(nickname)),
        catchError(err => of(err)))),
      catchError(err => of(err)))
      .subscribe((menu: any[]) => this._menu.next(menu));
  }

  public selectMenu(nickname?: string) {
    const homeItem$ = this.translate.getTranslation("menu.home");
    const destinationsItem$ = this.translate.getTranslation("menu.destinations");
    const managingItem$ = this.translate.getTranslation("menu.managing.top");
    const managingItemBookings$ = this.translate.getTranslation("menu.managing.bookings");
    const managingItemDestinations$ = this.translate.getTranslation("menu.managing.destinations");
    const adminManagingItem$ = this.translate.getTranslation("menu.managing.agents");
    const loginItem$ = this.translate.getTranslation("menu.login");
    const userProfileItem$ = this.translate.getTranslation("menu.user.top");
    const userProfileItemProfile$ = this.translate.getTranslation("menu.user.profile");
    const userProfileItemLogout$ = this.translate.getTranslation("menu.user.logout");
    const clientProfileItem$ = this.translate.getTranslation("menu.user.bookings");

    const customMenu$ = zip(
      homeItem$,
      destinationsItem$,
      managingItem$,
      managingItemBookings$,
      managingItemDestinations$,
      adminManagingItem$,
      loginItem$,
      userProfileItem$,
      userProfileItemProfile$,
      userProfileItemLogout$,
      clientProfileItem$)
      .pipe(
        switchMap(([
          home,
          destinations,
          management,
          managementBookings,
          managementsDestination,
          managementAgents,
          login,
          user,
          profile,
          logout,
          mybookings
        ]) => {
          this.translateMenuItems(home, destinations, management, managementBookings, managementsDestination, managementAgents, login, user, profile, logout, mybookings, nickname);
          return this.authFacade.role$.pipe(
            switchMap(role => {
              return of(this.createMenu(role));
            })
          );
        }), catchError(err => of(err)));

    return customMenu$
  }

  private translateMenuItems(
    home: string,
    destinations: string,
    management: string,
    managementBookings: string,
    managementsDestination: string,
    managementAgents: string,
    login: string,
    user: string,
    profile: string,
    logout: string,
    mybookings: string,
    nickname?: string
  ) {
    this.homeItem.label = home;
    this.destinationsItem.label = destinations;
    this.managingItem.label = management;
    this.adminManagingItem.label = management;
    this.managingItem.items[0].label = managementBookings;
    this.managingItem.items[1].label = managementsDestination;
    this.adminManagingItem.items[2].label = managementAgents;
    this.loginItem.label = login;
    this.userProfileItem.label = nickname ?? user;
    this.clientProfileItem.label = nickname ?? user;
    this.userProfileItem.items[0].label = profile;
    this.userProfileItem.items[1].label = logout;
    this.clientProfileItem.items[1].label = mybookings;
  }

  private createMenu(role: string | null): any[] {
    switch (role) {
      case 'AUTHENTICATED':
        return [
          this.homeItem,
          this.destinationsItem,
          this.clientProfileItem
        ];
      case 'ADMIN':
        return [
          this.homeItem,
          this.destinationsItem,
          this.adminManagingItem,
          this.userProfileItem
        ];
      case 'AGENT':
        return [
          this.homeItem,
          this.destinationsItem,
          this.managingItem,
          this.userProfileItem
        ];
      default:
        return [
          this.homeItem,
          this.destinationsItem,
          this.loginItem
        ];
    }
  }
}
