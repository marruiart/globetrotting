import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap } from "rxjs";
import { ExtendedAuthUser } from "../../models/globetrotting/auth.interface";
import { MenuService } from "../../services/menu.service";
import { ClientService } from "../../services/api/client.service";
import { AgentService } from "../../services/api/agent.service";
import { Agent } from "../../models/globetrotting/agent.interface";
import { Client } from "../../models/globetrotting/client.interface";

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private router: Router,
        private authSvc: AuthService,
        private clientSvc: ClientService,
        private agentSvc: AgentService,
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
                switchMap((user) => {
                    switch (user.role) {
                        case 'AGENT':
                        case 'ADMIN':
                            return this.agentSvc.agentMe(user.user_id).pipe(map((agent: Agent | null) => {
                                this.router.navigate(['/admin']);
                                user["agent_id"] = agent?.id ?? null;
                                console.log(`${user.user_id}: ${user.role} (agent: ${user.agent_id})`);
                                return AuthActions.assignRole({ user: user })
                            }), catchError(error => of(AuthActions.loginFailure({ error: error }))));
                        default:
                            return this.clientSvc.clientMe(user.user_id).pipe(map((client: Client | null) => {
                                this.router.navigate(['/home']);
                                user["client_id"] = client?.id ?? null;
                                console.log(`${user.user_id}: ${user.role} (client: ${user.client_id})`);
                                return AuthActions.assignRole({ user: user })
                            }), catchError(error => of(AuthActions.loginFailure({ error: error }))));
                    }
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