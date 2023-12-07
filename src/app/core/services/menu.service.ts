import { Injectable } from '@angular/core';
import { AuthFacade } from '../libs/auth/auth.facade';
import { BehaviorSubject, zip } from 'rxjs';
import { CustomTranslateService } from './custom-translate.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menu = new BehaviorSubject<any>({});
  public menu$ = this._menu.asObservable();
  private _nickname: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private nickname = this._nickname.asObservable();

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
    label: 'Login',
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

  public menuItems = {
    public: [
      this.homeItem,
      this.destinationsItem,
      this.loginItem
    ],
    client: [
      this.homeItem,
      this.destinationsItem,
      this.clientProfileItem
    ],
    agent: [
      this.homeItem,
      this.destinationsItem,
      this.managingItem,
      this.userProfileItem
    ],
    admin: [
      this.homeItem,
      this.destinationsItem,
      this.adminManagingItem,
      this.userProfileItem
    ]
  }

  constructor(
    private authFacade: AuthFacade,
    private translate: CustomTranslateService
  ) { }

  public selectMenu(role: string | null) {
    const homeItem$ = this.translate.getTranslation("menu.home");
    const destinationsItem$ = this.translate.getTranslation("menu.destinations");
    const managingItem$ = this.translate.getTranslation("menu.managing.top");
    const managingItemBookings$ = this.translate.getTranslation("menu.managing.bookings");
    const managingItemDestinations$ = this.translate.getTranslation("menu.managing.destinations");
    const adminManagingItem$ = this.translate.getTranslation("menu.managing.agents");
    const loginItem$ = this.translate.getTranslation("menu.login");
    const userProfileItem$ = this.translate.getTranslation("menu.user.top");
    const userNickname$ = this.nickname;
    const userProfileItemProfile$ = this.translate.getTranslation("menu.user.profile");
    const userProfileItemLogout$ = this.translate.getTranslation("menu.user.logout");
    const clientProfileItem$ = this.translate.getTranslation("menu.user.bookings");

    userNickname$.subscribe({
      next: nickname => {
        this.userProfileItem.label = nickname;
      },
      error: err => console.error(err)
    })

    zip(homeItem$,
      destinationsItem$,
      managingItem$,
      managingItemBookings$,
      managingItemDestinations$,
      adminManagingItem$,
      loginItem$,
      userProfileItem$,
      userProfileItemProfile$,
      userProfileItemLogout$,
      clientProfileItem$).subscribe({
        next: ([home,
          destinations,
          management,
          managementBookings,
          managementsDestination,
          managementAgents,
          login,
          user,
          profile,
          logout,
          mybookings]) => {
          this.homeItem.label = home;
          this.destinationsItem.label = destinations;
          this.managingItem.label = management;
          this.managingItem.items[0].label = managementBookings;
          this.managingItem.items[1].label = managementsDestination;
          this.adminManagingItem.items[2].label = managementAgents;
          this.loginItem.label = login;
          this.userProfileItem.label = user;
          this.userProfileItem.items[0].label = profile;
          this.userProfileItem.items[1].label = logout;
          this.clientProfileItem.items[1].label = mybookings

          switch (role) {
            case 'AUTHENTICATED':
              this._menu.next(this.menuItems.client)
              break;
            case 'ADMIN':
              this._menu.next(this.menuItems.admin)
              break;
            case 'AGENT':
              this._menu.next(this.menuItems.agent)
              break;
            default:
              this._menu.next(this.menuItems.public)
          }
        },
        error: err => console.error(err)
      });
  }

  public setNickname(nickname: string) {
    this._nickname.next(nickname);
  }
}
