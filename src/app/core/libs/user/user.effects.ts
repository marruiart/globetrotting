import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Router } from "@angular/router";
import * as UserActions from './user.actions'
import { catchError, concatMap, map, of, switchMap, tap } from "rxjs";
import { ClientService } from "../../services/api/client.service";
import { AgentService } from "../../services/api/agent.service";
import { Agent } from "../../models/globetrotting/agent.interface";
import { Client } from "../../models/globetrotting/client.interface";
import { UsersService } from "../../services/api/users.service";
import { CurrentUserData } from "../../models/globetrotting/user.interface";

@Injectable()
export class UserEffects {

    constructor(
        private actions$: Actions,
        private router: Router,
        private clientSvc: ClientService,
        private agentSvc: AgentService,
        private userSvc: UsersService,
    ) { }

    assignUserData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.initAssignUserData),
            switchMap((props) => this.userSvc.extendedMe(props.user.user_id).pipe(
                switchMap((extendedUser) => {
                    let data: CurrentUserData = {
                        extendedUser: extendedUser,
                        client: null,
                        agent: null
                    };
                    switch (props.user.role) {
                        case 'AGENT':
                        case 'ADMIN':
                            return this.agentSvc.agentMe(props.user.user_id).pipe(
                                tap((agent: Agent | null) => {
                                    data["agent"] = agent;
                                    console.log(`id ${props.user.user_id}: ${props.user.role} id ${agent?.id}`);
                                    this.router.navigate(['/admin']);
                                }), switchMap(() => {
                                    UserActions.assignUserData({ data: data });
                                    return of(UserActions.assignUserDataSuccess());
                                }), catchError(error => of(UserActions.assignUserDataFailure({ error: error })))
                            );
                        default:
                            return this.clientSvc.clientMe(props.user.user_id).pipe(
                                tap((client: Client | null) => {
                                    data["client"] = client;
                                    console.log(`id ${props.user.user_id}: ${props.user.role} id ${client?.id}`);
                                    this.router.navigate(['/home']);
                                }), switchMap(() => {
                                    UserActions.assignUserData({ data: data });
                                    return of(UserActions.assignUserDataSuccess());
                                }), catchError(error => of(UserActions.assignUserDataFailure({ error: error })))
                            );
                    }
                }), catchError(error => of(UserActions.assignUserDataFailure({ error: error })))
            )), catchError(error => of(UserActions.assignUserDataFailure({ error: error })))));

}