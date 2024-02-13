import { createReducer, on } from '@ngrx/store';
import * as AgentsActions from './agents.actions';
import { PaginatedAgent, TravelAgent } from '../../models/globetrotting/agent.interface';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { AgentsTableRow } from '../../models/globetrotting/user.interface';

export const AGENTS_FEATURE_KEY = 'agents'

export type AgentsState = {
    managementTable: AgentsTableRow[],
    agentsPage: PaginatedAgent,
    agents: TravelAgent[],
    error: any | null
}

export const initialState: AgentsState = {
    managementTable: [],
    agentsPage: emptyPaginatedData,
    agents: [],
    error: null
};

export const agentsReducer = createReducer(
    initialState,
    on(AgentsActions.savePage, (state, { agentsPage }) => ({ ...state, agentsPage: agentsPage, error: null })),
    on(AgentsActions.saveAgents, (state, { agents }) => ({ ...state, agents: agents, error: null })),
    on(AgentsActions.saveManagementTable, (state, { managementTable }) => ({ ...state, managementTable: managementTable, error: null })),
    on(AgentsActions.addAgentSuccess, (state) => ({ ...state, error: null })),
    on(AgentsActions.addAgentFailure, (state, { error }) => ({ ...state, error: error })),
    on(AgentsActions.updateAgentSuccess, (state) => ({ ...state, error: null })),
    on(AgentsActions.updateAgentFailure, (state, { error }) => ({ ...state, error: error })),
    on(AgentsActions.deleteAgentSuccess, (state) => ({ ...state, error: null })),
    on(AgentsActions.deleteAgentFailure, (state, { error }) => ({ ...state, error: error })),
);