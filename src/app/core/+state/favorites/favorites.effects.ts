import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as FavoritesActions from './favorites.actions'
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { FavoritesService } from "../../services/api/favorites.service";
import { Fav } from "../../models/globetrotting/fav.interface";

@Injectable()
export class FavoritesEffects {

    constructor(
        private actions$: Actions,
        private favsSvc: FavoritesService
    ) { }

    assignClientFavs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.assignClientFavs),
            map(({ clientFavs }) => FavoritesActions.assignClientFavsSuccess({ clientFavs })))
    );

    addFav$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.addFav),
            switchMap(({ newFav }) => this.favsSvc.addFav(newFav).pipe(
                map((fav: Fav) => {
                    return (fav) ? FavoritesActions.addFavSuccess()
                        : FavoritesActions.addFavFailure({ error: 'Error: Unknown favorite.' })
                }),
                catchError(error => of(FavoritesActions.addFavFailure({ error })))
            )))
    );

    deleteFav$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.deleteFav),
            exhaustMap(({ id }) => this.favsSvc.deleteFav(id).pipe(
                map(() => { 
                    return FavoritesActions.deleteFavSuccess()}),
                catchError(error => of(FavoritesActions.deleteFavFailure({ error })))
            )))
    );

}