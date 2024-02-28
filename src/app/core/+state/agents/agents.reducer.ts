import { createReducer, on } from '@ngrx/store';
import * as AgentsActions from './agents.actions';
import { AgentsTableRow } from '../../models/globetrotting/agent.interface';
import { AgentUser } from '../../models/globetrotting/user.interface';

export const AGENTS_FEATURE_KEY = 'agents'

export type AgentsState = {
    agentsMgmtTable: AgentsTableRow[],
    error: any | null
}

export const initialState: AgentsState = {
    agentsMgmtTable: [],
    error: null
};

export const agentsReducer = createReducer(
    initialState,
    on(AgentsActions.initAgentsFailure, (state, { error }) => ({ ...state, error: error })),

    on(AgentsActions.saveMgmtTableSuccess, (state, { mgmtTable }) => ({ ...state, agentsMgmtTable: [...mgmtTable], error: null })),

    on(AgentsActions.addAgentSuccess, (state) => ({ ...state, error: null })),
    on(AgentsActions.addAgentFailure, (state, { error }) => ({ ...state, error: error })),

    on(AgentsActions.updateAgentSuccess, (state) => ({ ...state, error: null })),
    on(AgentsActions.updateAgentFailure, (state, { error }) => ({ ...state, error: error })),

    on(AgentsActions.deleteAgentSuccess, (state) => ({ ...state, error: null })),
    on(AgentsActions.deleteAgentFailure, (state, { error }) => ({ ...state, error: error })),
);
