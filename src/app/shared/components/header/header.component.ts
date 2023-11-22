import { Component, OnInit } from '@angular/core';
import { State, Store, select } from '@ngrx/store';
import { MenuItem, SharedModule } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { AuthState } from 'src/app/core/libs/auth/auth.reducer';
import { selectCurrentUser } from 'src/app/core/libs/auth/auth.selectors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public user_id$: Observable<number | null>;
  public items?: MenuItem[];

  constructor(
    private store: Store<AuthState>
  ) {
    this.user_id$ = this.store.pipe(select(selectCurrentUser))
  }

  ngOnInit() {
    this.user_id$.subscribe(user_id => {
      console.log(`header user_id: ${user_id}`);
      if (user_id) {
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
                label: 'Salir',
                icon: 'custom-icon log-in-outline',
                routerLink: ['/home']
              }
            ],
            styleClass: "login-btn"
          },
        ];
      } else {
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
            label: 'Login',
            icon: 'custom-icon person-outline',
            routerLink: ['/login'],
            styleClass: "login-btn"
          },
        ];
      }
    });
  }

}
