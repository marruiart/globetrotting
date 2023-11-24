import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { MenuService } from 'src/app/core/services/menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public items?: MenuItem[];

  constructor(
    private authFacade: AuthFacade,
    public menuSvc: MenuService
  ) {
    this.authFacade.role$.subscribe({
      next: role => {
        this.menuSvc.selectMenu(role);
      },
      error: err => {
        console.error(err);
      }
    })
  }
}
