import { createFeatureSelector, createSelector } from "@ngrx/store";
import { FAVORITES_FEATURE_KEY, FavoritesState } from "./favorites.reducer";

const selectFeature = createFeatureSelector<FavoritesState>(FAVORITES_FEATURE_KEY);
export const selectClientFavs = createSelector(selectFeature, (state: FavoritesState) => state.clientFavs);
export const selectError = createSelector(selectFeature, (state: FavoritesState) => state.error);