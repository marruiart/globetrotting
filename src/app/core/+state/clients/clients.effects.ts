import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ClientsActions from './clients.actions'
import { map } from "rxjs";

@Injectable()
export class ClientsEffects {

    constructor(
        private actions$: Actions
    ) { }

    saveClientUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ClientsActions.saveClientUsers),
            map(({ clients }) => ClientsActions.saveClientUsersSuccess({ clients })))
    );
}