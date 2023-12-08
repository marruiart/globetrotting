import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemeItem } from 'src/app/core/themes-selectable/themes-selectable';

@Component({
  selector: 'app-theme-selectable-item',
  templateUrl: './theme-selectable-item.component.html',
  styleUrls: ['./theme-selectable-item.component.scss'],
})
export class ThemeSelectableItemComponent {
  @Input() isActiveTheme: boolean = false;
  @Input() theme: ThemeItem | null = null;
  @Output() onThemeSelected = new EventEmitter<ThemeItem>();

  /**
  * Emits an event when the artist is clicked.
  * @param artist The artist that was clicked.
  */
  onThemeClicked() {
    if (this.theme) {
      this.onThemeSelected.emit(this.theme);
    }
  }

}
