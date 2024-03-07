import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as ClientsActions from './clients.actions'
import * as ClientsSelector from './clients.selectors'
import {  User } from "../../models/globetrotting/user.interface";

@Injectable()
export class ClientsFacade {

    private readonly store = inject(Store);
    clients$ = this.store.pipe(select(ClientsSelector.selectClients));
    error$ = this.store.pipe(select(ClientsSelector.selectError));

    saveClients(clients: User[]) {
        this.store.dispatch(ClientsActions.saveClientUsers({ clients }));
    }

    logout() {
        this.store.dispatch(ClientsActions.logout());
    }
}