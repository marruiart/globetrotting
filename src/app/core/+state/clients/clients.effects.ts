import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ClientsActions from './clients.actions'
import { catchError, map, of, switchMap } from "rxjs";
import { UsersService } from "../../services/api/users.service";

@Injectable()
export class ClientsEffects {

    constructor(
        private actions$: Actions,
        private usersSvc: UsersService
    ) { }

    saveClientUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ClientsActions.saveClientUsers),
            map(({ clients }) => ClientsActions.saveClientUsersSuccess({ clients })))
    );
}