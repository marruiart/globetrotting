import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CLIENTS_FEATURE_KEY, ClientsState } from "./clients.reducer";

const selectFeature = createFeatureSelector<ClientsState>(CLIENTS_FEATURE_KEY);
export const selectClients = createSelector(selectFeature, (state: ClientsState) => state.clients);
export const selectError = createSelector(selectFeature, (state: ClientsState) => state.error);