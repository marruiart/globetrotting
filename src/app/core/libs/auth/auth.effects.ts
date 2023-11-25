import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, concatMap, map, of, switchMap, tap } from "rxjs";
import { ExtendedAuthUser } from "../../models/globetrotting/auth.interface";
import { MenuService } from "../../services/menu.service";
import { ClientService } from "../../services/api/client.service";
import { AgentService } from "../../services/api/agent.service";
import { Agent } from "../../models/globetrotting/agent.interface";
import { Client } from "../../models/globetrotting/client.interface";
import { UsersService } from "../../services/api/users.service";
import { User } from "../../models/globetrotting/user.interface";

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private router: Router,
        private authSvc: AuthService,
        private clientSvc: ClientService,
        private agentSvc: AgentService,
        private userSvc: UsersService,
        private menuSvc: MenuService
    ) { }

    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.init),
            switchMap(() => this.authSvc.me().pipe(
                map(user => {
                    let authUser: ExtendedAuthUser = {
                        user_id: user.user_id,
                        role: user.role,
                        extended_id: user.extended_id,
                        client_id: user.client_id,
                        agent_id: user.agent_id
                    }
                    return AuthActions.assignRole({ user: authUser })
                }),
                catchError(error => of(AuthActions.loginFailure({ error: error })))
            )))
    );

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            switchMap(props => this.authSvc.login(props.credentials).pipe(
                map(() => AuthActions.loginSuccess()),
                catchError(error => of(AuthActions.loginFailure({ error: error })))
            )))
    );

    assignRole$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            switchMap(() => this.authSvc.me().pipe(
                concatMap((user) => {
                    return this.userSvc.extendedMe(user.user_id).pipe(
                        switchMap((extended_user: User | null) => {
                            switch (user.role) {
                                case 'AGENT':
                                case 'ADMIN':
                                    return this.agentSvc.agentMe(user.user_id).pipe(
                                        switchMap((agent: Agent | null) => {
                                            this.router.navigate(['/admin']);
                                            user["agent_id"] = agent?.id ?? null;
                                            user["extended_id"] = extended_user?.id ?? null;
                                            console.log(`id ${user.user_id} (extended: ${user.extended_id}): ${user.role} (Agent id ${user.agent_id})`);
                                            return of(AuthActions.assignRole({ user: user }));
                                        }), catchError(error => of(AuthActions.loginFailure({ error: error }))));
                                default:
                                    return this.clientSvc.clientMe(user.user_id).pipe(
                                        switchMap((client: Client | null) => {
                                            this.router.navigate(['/home']);
                                            user["client_id"] = client?.id ?? null;
                                            user["extended_id"] = extended_user?.id ?? null;
                                            console.log(`id ${user.user_id} (extended: ${user.extended_id}): ${user.role} (Client id ${user.client_id})`);
                                            return of(AuthActions.assignRole({ user: user }));
                                        }), catchError(error => of(AuthActions.loginFailure({ error: error }))));
                            }
                        })
                    )
                }),
                catchError(error => of(AuthActions.loginFailure({ error: error })))
            )))
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            switchMap(() => this.authSvc.logout().pipe(
                map(() => {
                    this.menuSvc.selectMenu(null);
                    return AuthActions.logoutSuccess();
                }),
                catchError(error => of(AuthActions.logoutFailure({ error: error })))
            )))
    );
}