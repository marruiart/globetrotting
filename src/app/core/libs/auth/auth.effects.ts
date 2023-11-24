import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { JwtService } from "../../services/auth/jwt.service";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap, tap } from "rxjs";
import { AuthUser } from "../../models/globetrotting/auth.interface";

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private jwtSvc: JwtService,
        private router: Router,
        private authSvc: AuthService
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
                map(user => {
                    console.log(`${user.user_id}: ${user.role}`);
                    switch (user.role) {
                        case 'ADMIN':
                            this.router.navigate(['/admin'])
                            break;
                        case 'AGENT':
                            this.router.navigate(['/admin'])
                            break;
                        default:
                            this.router.navigate(['/home'])
                    }
                    return AuthActions.assignRole({ user: user })
                }),
                catchError(error => of(AuthActions.loginFailure({ error: error })))
            )))
    );

}