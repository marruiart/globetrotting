import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap } from "rxjs";
import { AuthUser, AuthUserOptions } from "../../models/globetrotting/auth.interface";
import { UserFacade } from "../load-user/load-user.facade";
import { AuthFacade } from "./auth.facade";
import { Router } from "@angular/router";
import { BACKEND } from "src/environments/environment";
import { FirebaseAuthUser } from "../../models/firebase-interfaces/firebase-user.interface";
import { StrapiAuthUser } from "../../models/strapi-interfaces/strapi-user.interface";

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
                map(isLogged => {
                    if (isLogged) {
                        return AuthActions.assignRole();
                    } else {
                        return AuthActions.loginFailure({ error: 'Usuario no loggeado' });
                    }
                }))))
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
            ofType(AuthActions.assignRole),
            switchMap(() => this.authSvc.me().pipe(
                map((user: AuthUserOptions) => {
                    let authUser;
                    if (BACKEND == 'Strapi') {
                        authUser = user as StrapiAuthUser;
                        console.log(`id ${authUser.user_id}: ${user.role}`);
                        this.userFacade.init(authUser);
                        return AuthActions.assignRoleSuccess({ user: authUser });
                    } else {
                        authUser = user as FirebaseAuthUser;
                        console.log(`id ${authUser.uid}: ${user.role}`);
                        this.userFacade.init(authUser);
                        return AuthActions.assignRoleSuccess({ user: authUser });
                    }
                }),
                catchError(error => of(AuthActions.assignRoleFailure({ error: error })))
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