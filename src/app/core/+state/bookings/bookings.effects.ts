import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as BookingsActions from './bookings.actions'
import { Observable, catchError, forkJoin, map, of, switchMap, zip } from "rxjs";
import { UsersService } from "../../services/api/users.service";
import { MappingService } from "../../services/api/mapping.service";
import { AgentRowInfo, BookingsTableRow, ClientRowInfo } from "../../models/globetrotting/booking.interface";
import { ExtUser } from "../../models/globetrotting/user.interface";
import { Roles, getUserName } from "../../utilities/utilities";
import { BookingsService } from "../../services/api/bookings.service";

@Injectable()
export class BookingsEffects {

    constructor(
        private actions$: Actions,
        private usersSvc: UsersService,
        private mappingSvc: MappingService,
        private bookingsSvc: BookingsService
    ) { }

    initBookings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.initBookings),
            switchMap(() => this.bookingsSvc.getAllBookings().pipe(
                map(_ => BookingsActions.initBookingsSuccess()),
                catchError(error => of(BookingsActions.initBookingsFailure({ error })))
            ))
        ))

    retrieveBookingsInfo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.retrieveBookingsInfo),
            switchMap(({ bookings, role }) => {
                let clientsObs: Observable<ExtUser>[] = [];
                let agentsObs: Observable<ExtUser | null>[] = [];
                let bookingsTable: BookingsTableRow[] = [];
                switch (role) {
                    case Roles.ADMIN:
                        for (let booking of bookings) {
                            clientsObs.push(this.usersSvc.getClientUser(booking.client_id) as Observable<ExtUser>);
                            agentsObs.push(this.usersSvc.getAgentUser(booking.agent_id ?? null));
                        }
                        return zip(forkJoin(clientsObs), forkJoin(agentsObs)).pipe(map(([clients, agents]) => {
                            for (let [i, booking] of bookings.entries()) {
                                const agent = agents[i];
                                const agentInfo = (agent) ? { agentName: `${agent.name} ${agent.surname}`, agent_id: agent?.user_id } as AgentRowInfo
                                    : { agentName: null, agent_id: null } as AgentRowInfo;
                                const client = clients[i];
                                const clientInfo = { clientName: getUserName(client), client_id: client?.user_id } as ClientRowInfo;
                                bookingsTable.push(this.mappingSvc.mapBookingTableRow(role, booking, clientInfo, agentInfo));
                            }
                            return BookingsActions.saveBookingsTableSuccess({ bookingsTable });
                        }), catchError(error => of(BookingsActions.saveBookingsTableFailure({ error }))))
                    case Roles.AGENT:
                        for (let booking of bookings) {
                            clientsObs.push(this.usersSvc.getClientUser(booking.client_id) as Observable<ExtUser>);
                        }
                        return forkJoin(clientsObs).pipe(map((clients) => {
                            for (let [i, booking] of bookings.entries()) {
                                const client = clients[i];
                                const clientInfo = { clientName: `${client.name} ${client.surname}`, client_id: client?.user_id } as ClientRowInfo;
                                bookingsTable.push(this.mappingSvc.mapBookingTableRow(role, booking, clientInfo));
                            }
                            return BookingsActions.saveBookingsTableSuccess({ bookingsTable });
                        }), catchError(error => of(BookingsActions.saveBookingsTableFailure({ error }))))
                    case Roles.AUTHENTICATED:
                        for (let booking of bookings) {
                            agentsObs.push(this.usersSvc.getAgentUser(booking.agent_id ?? null));
                        }
                        return forkJoin(agentsObs).pipe(map((agents) => {
                            for (let [i, booking] of bookings.entries()) {
                                const agent = agents[i];
                                const agentInfo = (agent) ? { agentName: `${agent.name} ${agent.surname}`, agent_id: agent?.user_id } as AgentRowInfo
                                    : { agentName: null, agent_id: null } as AgentRowInfo;
                                bookingsTable.push(this.mappingSvc.mapBookingTableRow(role, booking, undefined, agentInfo));
                            }
                            return BookingsActions.saveBookingsTableSuccess({ bookingsTable });
                        }), catchError(error => of(BookingsActions.saveBookingsTableFailure({ error }))))
                    default:
                        return of(BookingsActions.saveBookingsTableFailure({ error: 'ERROR: unknown user role.' }))
                }
            }))
    );

    saveBookings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.saveBookingsTable),
            map(({ bookings, role }) => {
                if (bookings) {
                    // TODO simplify to call only success or failure
                    const bookingsTable: BookingsTableRow[] = bookings.map(booking => {
                        const agentInfo = (booking.agentName) ? { agentName: `${booking.agentName}`, agent_id: booking.agent_id } as AgentRowInfo
                            : { agentName: null, agent_id: null } as AgentRowInfo;
                        const clientInfo = { clientName: `${booking.clientName}`, client_id: booking.client_id } as ClientRowInfo;
                        return this.mappingSvc.mapBookingTableRow(role, booking, clientInfo, agentInfo);
                    });
                    return BookingsActions.saveBookingsTableSuccess({ bookingsTable })
                } else {
                    return BookingsActions.saveBookingsTableFailure({ error: 'Error: Unable to create bookings table. Bookings information was not provided.' })
                }
            })
        ))

    /* addBooking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.addBooking),
            switchMap(({ newBooking }) => this.usersSvc.addUser(newBooking).pipe(
                map(_ => BookingsActions.addBookingSuccess()),
                catchError(error => of(BookingsActions.addBookingFailure({ error })))
            )))
    );

    updateBooking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.updateBooking),
            switchMap(({ booking }) => this.usersSvc.updateUser(booking).pipe(
                map(_ => BookingsActions.updateBookingSuccess()),
                catchError(error => of(BookingsActions.updateBookingFailure({ error })))
            )))
    );

    deleteBooking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.deleteBooking),
            exhaustMap(({ id }) => this.usersSvc.deleteUser(id).pipe(
                map(_ => BookingsActions.deleteBookingSuccess()),
                catchError(error => of(BookingsActions.deleteBookingFailure({ error })))
            )))
    ); */

}