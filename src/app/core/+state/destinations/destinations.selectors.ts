import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DESTINATIONS_FEATURE_KEY, DestinationsState } from "./destinations.reducer";

const selectFeature = createFeatureSelector<DestinationsState>(DESTINATIONS_FEATURE_KEY);
export const selectDestinations = createSelector(selectFeature, (state: DestinationsState) => state.destinations);
export const selectPage = createSelector(selectFeature, (state: DestinationsState) => state.destinationsPage);
export const selectError = createSelector(selectFeature, (state: DestinationsState) => state.error);