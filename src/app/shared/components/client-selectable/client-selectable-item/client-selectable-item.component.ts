import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExtUser } from 'src/app/core/models/globetrotting/user.interface';

@Component({
  selector: 'app-client-selectable-item',
  templateUrl: './client-selectable-item.component.html',
  styleUrls: ['./client-selectable-item.component.scss'],
})
export class ClientSelectableItemComponent {
  public name: string = '';
  private _clientExtUser: ExtUser | null = null;
  @Input() set clientExtUser(clientExtUser: ExtUser | null) {
    if (clientExtUser) {
      this._clientExtUser = clientExtUser;
    }
  };
  get clientExtUser(): ExtUser | null {
    return this._clientExtUser;
  }

  @Output() onClientSelected = new EventEmitter<ExtUser>();

  onUserClicked() {
    if (this._clientExtUser) {
      this.onClientSelected.emit(this._clientExtUser);
    }
  }

  getClientName(): string {
    if (this._clientExtUser && this._clientExtUser.name) {
      return `${this._clientExtUser?.name}${' ' + this._clientExtUser?.surname ?? ''}`;
    } else if (this._clientExtUser) {
      return this._clientExtUser.nickname;
    } else {
      return '';
    }
  }
}
