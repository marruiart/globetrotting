import { NgModule } from '@angular/core';

// Redux
import { StoreModule } from '@ngrx/store';
import { FavoritesEffects } from 'src/app/core/+state/favorites/favorites.effects';
import { EffectsModule } from '@ngrx/effects';
import { FavoritesFacade } from './favorites.facade';
import { FAVORITES_FEATURE_KEY, favoritesReducer } from './favorites.reducer';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(FAVORITES_FEATURE_KEY, favoritesReducer),
    EffectsModule.forFeature([FavoritesEffects]),
  ],
  providers: [
    FavoritesFacade
  ]
})
export class FavoritesModule { }
