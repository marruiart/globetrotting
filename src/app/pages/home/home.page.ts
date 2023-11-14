import { Component } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public themes: { code: string, name: string }[] = [
    {
      code: "lara-light-blue",
      name: "Lara Light Blue"
    },
    {
      code: "bootstrap4-dark-blue",
      name: "Bootstrap4 Dark Blue"
    }
  ];

  public selectedTheme: { code: string, name: string } = this.themes[0];

  constructor(
    private themeSvc: ThemeService
  ) { }

  public changeTheme(themeCode: string) {
    if (themeCode) {
      this.themeSvc.switchTheme(themeCode);
    }
  }

}
