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


    addDestination$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DestinationsActions.addDestination),
            switchMap(({ newDestination }) => this.destinationsSvc.addDestination(newDestination).pipe(
                map(_ => DestinationsActions.addDestinationSuccess()),
                catchError(error => of(DestinationsActions.addDestinationFailure({ error })))
            )))
    );

    updateDestination$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DestinationsActions.updateDestination),
            switchMap(({ destination }) => this.destinationsSvc.updateDestination(destination).pipe(
                map(_ => DestinationsActions.updateDestinationSuccess()),
                catchError(error => of(DestinationsActions.updateDestinationFailure({ error })))
            )))
    );

    deleteDestination$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DestinationsActions.deleteDestination),
            exhaustMap(({ id }) => this.destinationsSvc.deleteDestination(id).pipe(
                map(_ => DestinationsActions.deleteDestinationSuccess()),
                catchError(error => of(DestinationsActions.deleteDestinationFailure({ error })))
            )))
    );

}