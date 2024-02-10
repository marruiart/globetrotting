import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as FavoritesActions from './favorites.actions'
import * as FavoritesSelector from './favorites.selectors'
import { ClientFavDestination, NewFav } from '../../models/globetrotting/fav.interface';

@Injectable()
export class FavoritesFacade {

    private readonly store = inject(Store);
    clientFavs$ = this.store.pipe(select(FavoritesSelector.selectClientFavs));
    error$ = this.store.pipe(select(FavoritesSelector.selectError));

    assignClientFavs(favs: ClientFavDestination[]) {
        this.store.dispatch(FavoritesActions.assignClientFavs({ clientFavs: favs }));
    }

    addFav(newFav: NewFav) {
        this.store.dispatch(FavoritesActions.addFav({ newFav }));
    }

    deleteFav(id: string | number) {
        this.store.dispatch(FavoritesActions.deleteFav({ id }));
    }
}