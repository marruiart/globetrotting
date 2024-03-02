import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { ClientService } from 'src/app/core/services/api/client.service';
import { getUserName } from 'src/app/core/utilities/utilities';

export const CLIENT_SELECTABLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ClientSelectableComponent),
  multi: true
};

@Component({
  selector: 'app-client-selectable',
  templateUrl: './client-selectable.component.html',
  styleUrls: ['./client-selectable.component.scss'],
  providers: [CLIENT_SELECTABLE_VALUE_ACCESSOR]
})
export class ClientSelectableComponent implements ControlValueAccessor {
  public name: string = '';
  public selectedClient?: User;
  public disabled: boolean = false;
  public showSelectable: boolean = false;

  private _clients: User[] = [];
  @Input() set clients(clients: User[]) {
    if (clients) {
      this._clients = clients;
    }
  };
  get clients(): User[] {
    return (this._clients) ? this._clients : [];
  }

  constructor(
    private clientsSvc: ClientService
  ) { }

  /**
* Writes the value of the given object to the component.
* @param obj The object to write the value.
*/
  writeValue(obj: any): void {
    if (obj) {
      this.selectClient(obj);
    }
  }

  /** Registers a callback function that will be called when the value of this directive changes.
  * @param fn The callback function to be called.
  */
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

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

  public showClientSelectable() {
    this.showSelectable = true;
  }

  private hideClientSelectable() {
    this.showSelectable = false;
  }

  /**
  * Propagates a change of an object.
  * @param obj The object.
  */
  private propagateChange = (obj: any) => { }

  public async onClientSelected(clientExtUser: User) {
    this.name = getUserName(clientExtUser);
    let client = clientExtUser;
    if (!client.specific_id) {
      let clientSpecificUser = await lastValueFrom(this.clientsSvc.getClientByExtUserId(clientExtUser.user_id))
        .catch(err => {
          console.error(err);
          return undefined;
        });
      if (clientSpecificUser) {
        client = { ...clientExtUser, ...{ specific_id: clientSpecificUser.id } };
      }
    }
    if (client) {
      await this.selectClient(client, true);
    }
    this.hideClientSelectable();
  }

  public selectClient(client: User | undefined, propagate: boolean = false) {
    if (propagate && client) {
      this.selectedClient = client;
      this.propagateChange(this.selectedClient);
    }
  }

  public deselect() {
    this.selectClient(undefined);
    this.hideClientSelectable();
  }

}
