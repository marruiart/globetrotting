import { createFeatureSelector, createSelector } from "@ngrx/store";
import { BOOKINGS_FEATURE_KEY, BookingsState } from "./bookings.reducer";

const selectFeature = createFeatureSelector<BookingsState>(BOOKINGS_FEATURE_KEY);
export const selectBookingsTable = createSelector(selectFeature, (state: BookingsState) => state.bookingsTable);
export const selectError = createSelector(selectFeature, (state: BookingsState) => state.error);