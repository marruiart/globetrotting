import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AGENTS_FEATURE_KEY, AgentsState } from "./agents.reducer";

const selectFeature = createFeatureSelector<AgentsState>(AGENTS_FEATURE_KEY);
export const selectMgmtTable = createSelector(selectFeature, (state: AgentsState) => state.agentsMgmtTable);
export const selectError = createSelector(selectFeature, (state: AgentsState) => state.error);