import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { getUserName } from 'src/app/core/utilities/utilities';

@Component({
  selector: 'app-client-selectable-item',
  templateUrl: './client-selectable-item.component.html',
  styleUrls: ['./client-selectable-item.component.scss'],
})
export class ClientSelectableItemComponent {
  public name: string = '';

  private _clientExtUser: User | null = null;
  @Input() set clientExtUser(clientExtUser: User | null) {
    if (clientExtUser) {
      this.name = getUserName(clientExtUser);
      this._clientExtUser = clientExtUser;
    }
  };

  @Output() onClientSelected = new EventEmitter<User>();

  onUserClicked() {
    if (this._clientExtUser) {
      this.onClientSelected.emit(this._clientExtUser);
    }
  }

}
