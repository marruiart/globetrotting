import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AGENTS_FEATURE_KEY, AgentsState } from "./agents.reducer";

const selectFeature = createFeatureSelector<AgentsState>(AGENTS_FEATURE_KEY);
export const selectAgents = createSelector(selectFeature, (state: AgentsState) => state.agents);
export const selectPage = createSelector(selectFeature, (state: AgentsState) => state.agentsPage);
export const selectManagementTable = createSelector(selectFeature, (state: AgentsState) => state.managementTable);
export const selectError = createSelector(selectFeature, (state: AgentsState) => state.error);