import { Component, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { UserFacade } from 'src/app/core/libs/load-user/load-user.facade';
import { MenuService } from 'src/app/core/services/menu.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  public items?: MenuItem[];

  constructor(
    private authFacade: AuthFacade,
    public userFacade: UserFacade,
    public menuSvc: MenuService,
    public subsSvc: SubscriptionsService
  ) {
    // TODO recibir esto desde el padre
    this.subsSvc.addSubscriptions([{
      component: 'HeaderComponent',
      sub: this.authFacade.role$.subscribe({
        next: role => {
          this.menuSvc.selectMenu(role);
        },
        error: err => {
          console.error(err);
        }
      })
    },
    {
      component: 'HeaderComponent',
      sub: this.userFacade.nickname$.subscribe({
        next: nickname => {
          this.menuSvc.setNickname(nickname ?? "");
        },
        error: err => {
          console.error(err);
        }
      })
    }])
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('HeaderComponent');
  }

}
