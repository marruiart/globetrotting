import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
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
      console.log(themeCode);
    }
  }
}
