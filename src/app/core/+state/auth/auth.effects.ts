import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import { AdminAgentOrClientUser } from "../../models/globetrotting/user.interface";
import { AuthService } from "../../services/auth/auth.service";
import { Roles } from "../../utilities/utilities";
import * as AuthActions from './auth.actions';
import { AuthFacade } from "./auth.facade";

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private authSvc: AuthService,
        private authFacade: AuthFacade,
        private router: Router
    ) { }

    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.init),
            switchMap(() => this.authFacade.isLogged$.pipe(
                map(isLogged => (isLogged) ? AuthActions.me() : AuthActions.loginFailure({ error: null })),
                catchError(error => of(AuthActions.assignUserFailure({ error: error })))
            )))
    );

    me$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.me),
            switchMap(() => this.authSvc.me().pipe(
                map((user: AdminAgentOrClientUser) => AuthActions.assignUserSuccess({ user: user })),
                catchError(error => of(AuthActions.assignUserFailure({ error: error })))
            )))
    );

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            switchMap(({credentials}) => this.authSvc.login(credentials).pipe(
                map(() => AuthActions.loginSuccess()),
                catchError(error => of(AuthActions.loginFailure({ error: error })))
            )))
    );

    assignUserSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.assignUserSuccess),
            map(({ user }) => AuthActions.navigate({ role: user.role })))
    );

    navigate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.navigate),
            map(({ role }) => {
                console.log(role);
                if (role === Roles.ADMIN || role === Roles.AGENT) {
                    this.router.navigate(['/admin']);
                } else if (role === Roles.AUTHENTICATED) {
                    this.router.navigate(['/home']);
                }
                return AuthActions.navigateSuccess();
            }))
    );

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            switchMap(({ registerInfo, isAgent }) => this.authSvc.register(registerInfo, isAgent).pipe(
                map(() => AuthActions.registerSuccess()),
                catchError(error => of(AuthActions.registerFailure({ error: error })))
            )))
    );

    // FIXME register of agent don't have to login
    registerSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.registerSuccess),
            switchMap(() => of(AuthActions.loginSuccess())))
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            switchMap(() => this.authSvc.logout().pipe(
                map(() => {
                    this.router.navigate(['/home']);
                    return AuthActions.logoutSuccess();
                }),
                catchError(error => of(AuthActions.logoutFailure({ error: error })))
            )))
    );

    loginFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginFailure),
            map(() => AuthActions.logout()),
        )
    );

}