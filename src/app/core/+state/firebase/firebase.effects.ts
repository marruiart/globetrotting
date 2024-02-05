import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as FirebaseActions from './firebase.actions'
import { catchError, map, of, switchMap, tap } from "rxjs";
import { FirebaseService } from "../../services/firebase/firebase.service";
import { Sizes } from "./firebase.reducer";

@Injectable()
export class FirebaseEffects {

    constructor(
        private actions$: Actions,
        private firebaseSvc: FirebaseService
    ) { }

    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FirebaseActions.init),
            switchMap(() => this.firebaseSvc.initCollectionsSize().pipe(
                map(({ docs }) => {
                    let sizes: Sizes = {};
                    docs.forEach(doc => sizes[doc.id] = doc.data['size'])
                    return FirebaseActions.initSizesSuccess({ sizes })
                }),
                catchError(error => of(FirebaseActions.initSizesFailure({ error: error }))))))
    );

    updateSizes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FirebaseActions.updateSizes),
            map(({ collection }) => FirebaseActions.updateSizesSuccess({ collection })),
            tap(() => console.log('updateSizes$ effect executed')))
    );
}