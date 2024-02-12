import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as DestinationsActions from './destinations.actions'
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { DestinationsService } from "../../services/api/destinations.service";
import { Destination } from "../../models/globetrotting/destination.interface";

@Injectable()
export class DestinationsEffects {

    constructor(
        private actions$: Actions,
        private destinationsSvc: DestinationsService
    ) { }

    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DestinationsActions.init),
            map(({ destinations }) => {
                return (destinations) ? DestinationsActions.initSuccess({ destinations })
                    : DestinationsActions.initFailure({ error: 'Error: Unknown destinations' })
            }))
    );

    savePage$ = createEffect(() =>
    this.actions$.pipe(
        ofType(DestinationsActions.savePage),
        map(({ destinationsPage }) => {
            return (destinationsPage) ? DestinationsActions.savePageSuccess({ destinationsPage })
                : DestinationsActions.savePageFailure({ error: 'Error: Unknown destinations' })
        }))
);

    addDestination$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DestinationsActions.addDestination),
            switchMap(({ newDestination }) => this.destinationsSvc.addDestination(newDestination).pipe(
                map((fav: Destination) => {
                    return (fav) ? DestinationsActions.addDestinationSuccess()
                        : DestinationsActions.addDestinationFailure({ error: 'Error: Unknown favorite.' })
                }),
                catchError(error => of(DestinationsActions.addDestinationFailure({ error })))
            )))
    );

    deleteDestination$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DestinationsActions.deleteDestination),
            exhaustMap(({ id }) => this.destinationsSvc.deleteDestination(id).pipe(
                map(() => {
                    return DestinationsActions.deleteDestinationSuccess()
                }),
                catchError(error => of(DestinationsActions.deleteDestinationFailure({ error })))
            )))
    );

}