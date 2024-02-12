import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as FirebaseActions from './firebase.actions'
import { map, tap } from "rxjs";
import { Sizes } from "./firebase.reducer";

@Injectable()
export class FirebaseEffects {

    constructor(
        private actions$: Actions
    ) { }

    initSizes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FirebaseActions.initSizes),
            map(({ docs }) => {
                let sizes: Sizes = {};
                docs.forEach(doc => sizes[doc.id] = doc.data['size']);
                return FirebaseActions.initSizesSuccess({ sizes })
            }))
    );

    updateSizes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FirebaseActions.updateSizes),
            map(({ collection }) => FirebaseActions.updateSizesSuccess({ collection })),
            tap(() => console.log('updateSizes$ effect executed')))
    );
}