import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Router } from "@angular/router";
import * as UserActions from './load-user.actions'
import { Observable, catchError, map, of, switchMap, tap } from "rxjs";
import { ClientService } from "../../services/api/client.service";
import { AgentService } from "../../services/api/agent.service";
import { TravelAgent } from "../../models/globetrotting/agent.interface";
import { Client } from "../../models/globetrotting/client.interface";
import { UsersService } from "../../services/api/users.service";
import { User } from "../../models/globetrotting/user.interface";
import { UserFacade } from "./load-user.facade";

@Injectable()
export class UserEffects {

    constructor(
        private actions$: Actions,
        private router: Router,
        private clientSvc: ClientService,
        private agentSvc: AgentService,
        private userFacade: UserFacade,
        private userSvc: UsersService
    ) { }

    loadUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.loadUser),
            switchMap((props) => {
                const role = props.user.role;
                const user_id = props.user.user_id;
                this.userFacade.loadExtendedUser(user_id);
                this.userFacade.loadSpecificUser(user_id, role);
                if (role == 'ADMIN' || role == 'AGENT') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/home']);
                }
                return of(UserActions.loadUserSuccess());
            })))

    loadExtendedUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.loadExtendedUser),
            switchMap((props) => {
                const user_id = props.user_id;
                let user: User | null = null;
                return this.userSvc.extendedMe(user_id).pipe(
                    map((extendedUser) => {
                        user = extendedUser;
                        return UserActions.assignExtendedUser({ extendedUser: user });
                    }), catchError(error => of(UserActions.loadUserFailure({ error: error })))
                )
            })))

    loadSpecificUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.loadSpecificUser),
            switchMap((props) => {
                let user: TravelAgent | Client | null = null;
                let specificUser$: Observable<any>;
                const role = props.role;
                const user_id = props.user_id;
                switch (role) {
                    case 'AGENT':
                    case 'ADMIN':
                        specificUser$ = this.agentSvc.agentMe(user_id).pipe(
                            tap((agent: TravelAgent | null) => {
                                if (agent) {
                                    user = agent;
                                } else {
                                    throw new Error('Specific user not found');
                                }
                            }), catchError(error => of(UserActions.loadUserFailure({ error: error }))));
                        break
                    case 'AUTHENTICATED':
                        specificUser$ = this.clientSvc.clientMe(user_id).pipe(
                            tap((client: Client | null) => {
                                if (client) {
                                    user = client;
                                } else {
                                    throw new Error('Specific user not found');
                                }
                            }), catchError(error => of(UserActions.loadUserFailure({ error: error }))));
                        break;
                    default:
                        specificUser$ = of(null);
                }
                return specificUser$.pipe(map(_ => UserActions.assignSpecificUser({ specificUser: user })),
                    catchError(error => of(UserActions.loadUserFailure({ error: error }))));
            }), catchError(error => of(UserActions.loadUserFailure({ error: error })))))

}