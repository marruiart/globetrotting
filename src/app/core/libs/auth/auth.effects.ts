import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap } from "rxjs";
import { MenuService } from "../../services/menu.service";
import { AuthUser } from "../../models/globetrotting/auth.interface";
import { UserFacade } from "../load-user/load-user.facade";

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private authSvc: AuthService,
        private userFacade: UserFacade,
        private menuSvc: MenuService
    ) { }

    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.init),
            switchMap(() => this.authSvc.me().pipe(
                map(user => {
                    let authUser: AuthUser = {
                        user_id: user.user_id,
                        role: user.role
                    }
                    this.userFacade.init(user);
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
                    switch (user.role) {
                        case 'AGENT':
                        case 'ADMIN':
                            console.log(`id ${user.user_id}: ${user.role}`);
                            break;
                        default:
                            console.log(`id ${user.user_id}: ${user.role}`);
                            break;
                    }
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
                    this.menuSvc.selectMenu(null);
                    return AuthActions.logoutSuccess();
                }),
                catchError(error => of(AuthActions.logoutFailure({ error: error })))
            )))
    );
}