import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    public translate: TranslateService,
    private router: Router
  ) { }

  /**
 * Changes the application's theme.
 *
 * This method switches the current theme of the application to the specified theme code.
 *
 * @param themeCode The code of the new theme to be applied.
 */
  public changeTheme(themeCode: string) {
    if (themeCode) {
      this.themeSvc.switchTheme(themeCode);
    }
  }

  /**
 * Navigates to the destinations page.
 *
 * This method redirects the user to the destinations page using the Angular router.
 */
  public async navigateDestinations() {
    this.router.navigate(['/destinations']);
  }
}
