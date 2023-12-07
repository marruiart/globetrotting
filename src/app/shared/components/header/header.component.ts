import { Component, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { combineLatest } from 'rxjs';
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
  private _role: string | null = null;

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
          this._role = role;
          this.menuSvc.selectMenu(role);
        },
        error: err => {
          console.error(err);
        }
      })
    }, {
      component: 'HeaderComponent',
      sub: combineLatest([this.menuSvc.menu$, this.userFacade.nickname$]).subscribe(([menu, nickname]) => {
        if (nickname) {
          this.menuSvc.setNickname(nickname);
        }
      })
    }])
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('HeaderComponent');
  }

}
