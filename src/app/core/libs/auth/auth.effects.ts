import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { JwtService } from "../../services/auth/jwt.service";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap } from "rxjs";

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private jwtSvc: JwtService,
        private router: Router,
        private authSvc: AuthService
    ) { }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            switchMap(props => this.authSvc.login(props.credentials).pipe(
                map(() => AuthActions.loginSuccess()),
                catchError(error => of(AuthActions.loginFailure({ error: error })))
            ))));

    assignRole$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            switchMap(() => this.authSvc.me().pipe(
                map(user => {
                    switch (user.role) {
                        case 'ADMIN':
                            console.log(user.role);
                            this.router.navigate(['/destinations'])
                            break;
                        case 'AGENT':
                            console.log(user.role);
                            this.router.navigate(['/home'])
                            break;
                        default:
                            console.log(user.role);
                            this.router.navigate(['/home'])
                    }
                    return AuthActions.assignRole({ user: user })
                }),
                catchError(error => of(AuthActions.loginFailure({ error: error })))
            ))));

}