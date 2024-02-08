import { createFeatureSelector, createSelector } from "@ngrx/store";
import { FIREBASE_FEATURE_KEY, FirebaseState } from "./firebase.reducer";

const selectFeature = createFeatureSelector<FirebaseState>(FIREBASE_FEATURE_KEY);
export const selectSizes = createSelector(selectFeature, (state: FirebaseState) => state.sizes);
export const selectError = createSelector(selectFeature, (state: FirebaseState) => state.error);