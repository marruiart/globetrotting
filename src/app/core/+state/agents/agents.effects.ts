import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as AgentsActions from './agents.actions'
import { Observable, catchError, forkJoin, map, of, switchMap, throwError } from "rxjs";
import { UsersService } from "../../services/api/users.service";
import { AuthService } from "../../services/auth/auth.service";
import { AgentUser, User, UserCredentials } from "../../models/globetrotting/user.interface";
import { MappingService } from "../../services/api/mapping.service";
import { AgentService } from "../../services/api/agent.service";

@Injectable()
export class AgentsEffects {

    constructor(
        private actions$: Actions,
        private usersSvc: UsersService,
        private agentsSvc: AgentService,
        private authSvc: AuthService,
        private mappingSvc: MappingService
    ) { }

    initAgents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.initAgents),
            switchMap(() => this.agentsSvc.getAllAgents().pipe(
                map(_ => AgentsActions.initAgentsSuccess()),
                catchError(error => of(AgentsActions.initAgentsFailure({ error })))
            ))
        ))

    /**
    * Receives an array of travel agents and turns it into an array of rows ready to display on a table.
    * @param agents array of all the travel agents
    */
    retrieveAgentInfo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.retrieveAgentsInfo),
            switchMap(({ agents }) => {
                let tableRowObs: Observable<AgentUser>[] = [];
                for (let agent of agents) {
                    const extUser$ = this.usersSvc.getAgentUser(agent.user_id);
                    // For each booking, add a TableRow observable
                    tableRowObs.push(extUser$.pipe(
                        switchMap((extUser: User | null): Observable<AgentUser> => {
                            if (extUser) {
                                return of(extUser as AgentUser);
                            }
                            return throwError(() => "Error: Unable to retrieve the extended user data.");
                        }), catchError(err => of(err))))
                }
                // ForkJoin the "array of observables" to return "an observable of an array"
                return forkJoin(tableRowObs).pipe(
                    map(agents => AgentsActions.saveAgents({ agents })),
                    catchError(error => of(AgentsActions.saveAgentsFailure({ error }))))
            }))
    );

    saveAgents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.saveAgents),
            map(({ agents }) => {
                if (agents) {
                    const mgmtTable = agents.map(agent => this.mappingSvc.mapAgentTableRow(agent));
                    return AgentsActions.saveMgmtTableSuccess({ mgmtTable })
                } else {
                    return AgentsActions.saveMgmtTableFailure({ error: 'Error: Unable to create agents table. Agents is empty.' })
                }
            })
        ))

    /* addAgent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.addAgent),
            switchMap(({ newAgent }) => this.usersSvc.addUser(newAgent).pipe(
                map(_ => AgentsActions.addAgentSuccess()),
                catchError(error => of(AgentsActions.addAgentFailure({ error })))
            )))
    );

    updateAgent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.updateAgent),
            switchMap(({ agent }) => this.usersSvc.updateUser(agent).pipe(
                map(_ => AgentsActions.updateAgentSuccess()),
                catchError(error => of(AgentsActions.updateAgentFailure({ error })))
            )))
    );

    deleteAgent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentsActions.deleteAgent),
            exhaustMap(({ id }) => this.usersSvc.deleteUser(id).pipe(
                map(_ => AgentsActions.deleteAgentSuccess()),
                catchError(error => of(AgentsActions.deleteAgentFailure({ error })))
            )))
    ); */

}