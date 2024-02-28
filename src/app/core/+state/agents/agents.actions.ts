import { createAction, props } from '@ngrx/store';
import { TravelAgent, NewTravelAgent } from '../../models/globetrotting/agent.interface';
import { AgentsTableRow } from '../../models/globetrotting/agent.interface';
import { AgentUser } from '../../models/globetrotting/user.interface';

export const initAgents = createAction('[Agents API] Init Agents');
export const initAgentsSuccess = createAction('[Agents API] Init Agents Success');
export const initAgentsFailure = createAction('[Agents API] Init Agents Failure', props<{ error: any }>());

export const saveAgents = createAction('[Agents API] Save Agents', props<{ agents: AgentUser[] }>());
export const saveAgentsFailure = createAction('[Agents API] Save Agents Failure', props<{ error: any }>());

export const retrieveAgentsInfo = createAction('[Agents API] Retrieve Agents Info', props<{ agents: TravelAgent[] }>());
export const saveMgmtTableSuccess = createAction('[Agents API] Save Management Table Success', props<{ mgmtTable: AgentsTableRow[] }>());
export const saveMgmtTableFailure = createAction('[Agents API] Save Management Table Failure', props<{ error: any }>());

export const addAgent = createAction('[Agents API] Add TravelAgent', props<{ newAgent: NewTravelAgent }>());
export const addAgentSuccess = createAction('[Agents API] Add TravelAgent Success');
export const addAgentFailure = createAction('[Agents API] Add TravelAgent Failure', props<{ error: any }>());

export const updateAgent = createAction('[Agents API] Update TravelAgent', props<{ agent: TravelAgent }>());
export const updateAgentSuccess = createAction('[Agents API] Update TravelAgent Success');
export const updateAgentFailure = createAction('[Agents API] Update TravelAgent Failure', props<{ error: any }>());

export const deleteAgent = createAction('[Agents API] Delete TravelAgent', props<{ id: number | string }>());
export const deleteAgentSuccess = createAction('[Agents API] Delete TravelAgent Success');
export const deleteAgentFailure = createAction('[Agents API] Delete TravelAgent Failure', props<{ error: any }>());