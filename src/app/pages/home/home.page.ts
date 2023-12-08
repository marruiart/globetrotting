import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public themes: { code: string, name: string }[] = [
    {
      code: "lara-dark-blue",
      name: "Lara Dark Blue"
    },
    {
      code: "lara-dark-indigo",
      name: "Lara Dark Indigo"
    },
    {
      code: "lara-dark-purple",
      name: "Lara Dark Purple"
    },
    {
      code: "lara-dark-teal",
      name: "Lara Dark Teal"
    },
    {
      code: "lara-light-blue",
      name: "Lara Light Blue"
    },
    {
      code: "lara-light-indigo",
      name: "Lara Light Indigo"
    },
    {
      code: "lara-light-purple",
      name: "Lara Light Purple"
    },
    {
      code: "lara-light-teal",
      name: "Lara Light Teal"
    },
    {
      code: "my-theme",
      name: "My Theme"
    }
  ];

  public selectedTheme: { code: string, name: string } = this.themes[0];

  constructor(
    private themeSvc: ThemeService,
    public translate: TranslateService
  ) { }

  public changeTheme(themeCode: string) {
    if (themeCode) {
      this.themeSvc.switchTheme(themeCode);
    }
  }

}
