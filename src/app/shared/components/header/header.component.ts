import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { menuItems } from 'src/app/core/models/globetrotting/menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public items?: MenuItem[];

  constructor(
    private authFacade: AuthFacade
  ) {
    this.authFacade.role$.subscribe({
      next: role => {
        switch (role) {
          case 'AUTHENTICATED':
            this.items = menuItems.client;
            break;
          case 'ADMIN':
            this.items = menuItems.admin;
            break;
          case 'AGENT':
            this.items = menuItems.agent;
            break;
          default:
            this.items = menuItems.public
        }
      },
      error: err => {
        console.error(err);
      }
    })
  }
}
