import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ThemeItem, themes } from 'src/app/core/themes-selectable/themes-selectable';

@Component({
  selector: 'app-theme-selectable',
  templateUrl: './theme-selectable.component.html',
  styleUrls: ['./theme-selectable.component.scss'],
})
export class ThemeSelectableComponent implements ControlValueAccessor {
  public themes = themes;
  public showSelectable: boolean = false;
  public selectedTheme: ThemeItem = themes[4];
  public disabled: boolean = true;
  private _theme: string | null = null;
  public position: "topright" = 'topright';

  @Input() set theme(_theme: string | null) {
    this._theme = _theme;
    if (this._theme) {
    }
  }

  constructor(
    private themeSvc: ThemeService
  ) { }

  /**
  * Writes the value of the given object to the component.
  * @param obj The object to write the value.
  */
  writeValue(obj: any): void {
    this.selectTheme(obj);
  }

  /** Registers a callback function that will be called when the value of this directive changes.
  * @param fn The callback function to be called.
  */
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  /**
  * Propagates a change of an object.
  * @param obj The object.
  */
  propagateChange = (obj: any) => { }

  /**
  * Not implemented.
  * @param fn
  */
  registerOnTouched(fn: any): void { }

  /**
  * Change the value of disabled.
  * @param isDisabled New value.
  */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
 * Displays the theme selection UI.
 *
 * @returns void
 */
  public showThemeSelectable() {
    this.showSelectable = true;
  }

  /**
 * Hides the theme selection UI.
 *
 * @returns void
 */
  private hideThemeSelectable() {
    this.showSelectable = false;
  }

  /**
   * Selects a theme by its code and updates the UI accordingly.
   *
   * @param theme - The theme to select. If null, a default theme is selected.
   * @returns void
   */
  public selectTheme(theme: ThemeItem | null) {
    if (theme) {
      this.themeSvc.switchTheme(theme.code);
      this.selectedTheme = theme;
    }
    else {
      this.selectedTheme = themes[4];
    }
    this.hideThemeSelectable();
  }

}
