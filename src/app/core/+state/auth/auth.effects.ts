import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap } from "rxjs";
import { AuthFacade } from "./auth.facade";
import { Router } from "@angular/router";
import { User } from "../../models/globetrotting/user.interface";

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
                map(isLogged => (isLogged) ? AuthActions.assignUser() : AuthActions.loginFailure({ error: null })),
                catchError(error => of(AuthActions.assignUserFailure({ error: error })))
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

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            switchMap(props => this.authSvc.register(props.registerInfo).pipe(
                map(() => AuthActions.registerSuccess()),
                catchError(error => of(AuthActions.registerFailure({ error: error })))
            )))
    );

    registerSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.registerSuccess),
            switchMap(() => of(AuthActions.loginSuccess())))
    );

    assignUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.assignUser),
            switchMap(() => this.authSvc.me().pipe(
                map((user: User) => {
                    console.log(user.user_id, user.role);
                    if (user.role == 'ADMIN' || user.role == 'AGENT') {
                        this.router.navigate(['/admin']);
                    } else {
                        this.router.navigate(['/home']);
                    }
                    return AuthActions.assignUserSuccess({ user: user });
                }),
                catchError(error => of(AuthActions.assignUserFailure({ error: error })))
            )))
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