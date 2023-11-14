import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  public items?: MenuItem[];

  ngOnInit() {
    this.items = [
      {
        label: 'Inicio',
        icon: 'custom-icon home-outline',
        routerLink: ['/home']
      },
      {
        label: 'Destinos',
        icon: 'custom-icon paper-plane-outline',
        routerLink: ['/destinations']
      },
      {
        icon: 'custom-icon person-outline',
        items: [
          {
            label: 'Login',
            icon: 'custom-icon log-in-outline',
            routerLink: ['/login']
          }
        ],
        styleClass: "login-btn"
      },
    ];
  }

}
