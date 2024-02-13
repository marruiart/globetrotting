import { createAction, props } from '@ngrx/store';
import { TravelAgent, PaginatedAgent, NewTravelAgent } from '../../models/globetrotting/agent.interface';
import { AgentsTableRow } from '../../models/globetrotting/user.interface';

export const savePage = createAction('[Agents API] Save Page', props<{ agentsPage: PaginatedAgent }>());
export const saveAgents = createAction('[Agents API] Save Agents', props<{ agents: TravelAgent[] }>());
export const saveManagementTable = createAction('[Agents API] Save Management Table', props<{ managementTable: AgentsTableRow[] }>());

export const addAgent = createAction('[Agents API] Add TravelAgent', props<{ newAgent: NewTravelAgent }>());
export const addAgentSuccess = createAction('[Agents API] Add TravelAgent Success');
export const addAgentFailure = createAction('[Agents API] Add TravelAgent Failure', props<{ error: any }>());

export const updateAgent = createAction('[Agents API] Update TravelAgent', props<{ agent: TravelAgent }>());
export const updateAgentSuccess = createAction('[Agents API] Update TravelAgent Success');
export const updateAgentFailure = createAction('[Agents API] Update TravelAgent Failure', props<{ error: any }>());

export const deleteAgent = createAction('[Agents API] Delete TravelAgent', props<{ id: number | string }>());
export const deleteAgentSuccess = createAction('[Agents API] Delete TravelAgent Success');
export const deleteAgentFailure = createAction('[Agents API] Delete TravelAgent Failure', props<{ error: any }>());