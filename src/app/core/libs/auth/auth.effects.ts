import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap } from "rxjs";
import { MenuService } from "../../services/menu.service";
import { AuthUser } from "../../models/globetrotting/auth.interface";
import { UserFacade } from "../load-user/load-user.facade";
import { AuthFacade } from "./auth.facade";
import { Router } from "@angular/router";

/* 
'(isLogged: boolean) => Observable<({ user: AuthUser; } & TypedAction<"[Auth API] Assign Role">) | ({ error: any; } & TypedAction<"[Auth API] Login Failure">)> | null'
'(value: boolean, index: number) => ObservableInput<any>'.

'Observable<({ user: AuthUser; } & TypedAction<"[Auth API] Assign Role">) | ({ error: any; } & TypedAction<"[Auth API] Login Failure">)> | null'
'ObservableInput<any>'.

'null'
'ObservableInput<any>'.
*/

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private authSvc: AuthService,
        private userFacade: UserFacade,
        private authFacade: AuthFacade,
        private router: Router
    ) { }

    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.init),
            switchMap(() => this.authFacade.isLogged$.pipe(
                switchMap(isLogged => {
                    if (isLogged) {
                        return this.authSvc.me().pipe(
                            map(user => {
                                let authUser: AuthUser = {
                                    user_id: user.user_id,
                                    role: user.role
                                }
                                this.userFacade.init(user);
                                return AuthActions.assignRole({ user: authUser });
                            }),
                            catchError(error => of(AuthActions.loginFailure({ error: error })))
                        )
                    } else {
                        return of(AuthActions.loginFailure({ error: 'Usuario no loggeado' }));
                    }
                })
            )
            ))
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

    assignRole$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            switchMap(() => this.authSvc.me().pipe(
                map((user: AuthUser) => {
                    console.log(`id ${user.user_id}: ${user.role}`);
                    this.userFacade.init(user);
                    return AuthActions.assignRole({ user: user });
                }), catchError(error => of(AuthActions.loginFailure({ error: error })))
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
}