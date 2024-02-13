import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as AgentsActions from './agents.actions'
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { UsersService } from "../../services/api/users.service";
import { AuthFacade } from "../auth/auth.facade";

@Injectable()
export class AgentsEffects {

    constructor(
        private actions$: Actions,
        private usersSvc: UsersService,
        private authFacade: AuthFacade
    ) { }


    /* addAgent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.addAgent),
            switchMap(({ newAgent }) => this.usersSvc.addUser(newAgent).pipe(
                map(_ => AgentsActions.addAgentSuccess()),
                catchError(error => of(AgentsActions.addAgentFailure({ error })))
            )))
    );

    updateAgent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.updateAgent),
            switchMap(({ agent }) => this.usersSvc.updateUser(agent).pipe(
                map(_ => AgentsActions.updateAgentSuccess()),
                catchError(error => of(AgentsActions.updateAgentFailure({ error })))
            )))
    );

    deleteAgent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.deleteAgent),
            exhaustMap(({ id }) => this.usersSvc.deleteUser(id).pipe(
                map(_ => AgentsActions.deleteAgentSuccess()),
                catchError(error => of(AgentsActions.deleteAgentFailure({ error })))
            )))
    ); */

}