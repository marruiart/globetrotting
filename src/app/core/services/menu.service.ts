import { Injectable } from '@angular/core';
import { AuthFacade } from '../libs/auth/auth.facade';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menu = new BehaviorSubject<any>({});
  public menu$ = this._menu.asObservable()

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
        routerLink: ['/bookings']
      },
      {
        label: 'Gestionar destinos',
        icon: 'custom-icon trail-sign-outline',
        routerLink: ['/destinations-management']
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
        routerLink: ['/home']
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
    private authFacade: AuthFacade
  ) { }

  public selectMenu(role: string | null) {
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
  }

  public setNickname(nickname: string) {
    this.userProfileItem.label = nickname;
    this.clientProfileItem.label = nickname;
  }
}
