import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ThemeItem, themes } from 'src/app/core/themes-selectable/themes-selectable';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public themes = themes;
  public selectedTheme: ThemeItem = themes[0];

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
