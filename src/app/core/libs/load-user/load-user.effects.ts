import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Router } from "@angular/router";
import * as UserActions from './load-user.actions'
import { catchError, mergeMap, of, switchMap, tap } from "rxjs";
import { ClientService } from "../../services/api/client.service";
import { AgentService } from "../../services/api/agent.service";
import { Agent } from "../../models/globetrotting/agent.interface";
import { Client } from "../../models/globetrotting/client.interface";
import { UsersService } from "../../services/api/users.service";
import { CurrentUser } from "../../models/globetrotting/user.interface";

@Injectable()
export class UserEffects {

    constructor(
        private actions$: Actions,
        private router: Router,
        private clientSvc: ClientService,
        private agentSvc: AgentService,
        private userSvc: UsersService
    ) { }

    assignUserData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.loadUser),
            switchMap((props) => {
                const role = props.user.role;
                const user_id = props.user.user_id;

                return this.userSvc.extendedMe(user_id).pipe(
                    switchMap((extendedUser) => {
                        if (extendedUser) {
                            let user: CurrentUser = {
                                extendedUser: extendedUser,
                                specificUser: null
                            }
                            UserActions.assignExtendedUser({ user: user });

                            let specificUser$;
                            switch (role) {
                                case 'AGENT':
                                case 'ADMIN':
                                    specificUser$ = this.agentSvc.agentMe(user_id).pipe(
                                        tap((agent: Agent | null) => {
                                            if (agent) {
                                                user.specificUser = agent;
                                                console.log(`id ${user_id}: ${role} id ${agent?.id}`);
                                                this.router.navigate(['/admin']);
                                            } else {
                                                throw new Error('Specific user not found');
                                            }
                                        }), catchError(error => of(UserActions.loadUserFailure({ error: error })))
                                    );
                                    break
                                case 'AUTHENTICATED':
                                    specificUser$ = this.clientSvc.clientMe(user_id).pipe(
                                        tap((client: Client | null) => {
                                            if (client) {
                                                user.specificUser = client;
                                                console.log(`id ${user_id}: ${role} id ${client?.id}`);
                                                this.router.navigate(['/home']);
                                            } else {
                                                throw new Error('Specific user not found');
                                            }
                                        }), catchError(error => of(UserActions.loadUserFailure({ error: error })))
                                    );
                                    break;
                                default:
                                    specificUser$ = of(null);
                            }
                            return specificUser$.pipe(
                                mergeMap(() => {
                                    UserActions.assignSpecificUser({ user: user });
                                    return of(UserActions.loadUserSuccess());
                                })
                            )
                        } else {
                            throw new Error('Extended user not found');
                        }
                    }), catchError(error => of(UserActions.loadUserFailure({ error: error })))
                );
            }), catchError(error => of(UserActions.loadUserFailure({ error: error })))));

}