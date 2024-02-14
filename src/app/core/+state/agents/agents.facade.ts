import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as AgentsActions from './agents.actions'
import * as AgentsSelector from './agents.selectors'
import { AgentsTableRow } from '../../models/globetrotting/agent.interface';
import { NewTravelAgent, PaginatedAgent, TravelAgent } from "../../models/globetrotting/agent.interface";
import { AgentUser } from "../../models/globetrotting/user.interface";

@Injectable()
export class AgentsFacade {

    private readonly store = inject(Store);
    agents$ = this.store.pipe(select(AgentsSelector.selectAgents));
    agentTable$ = this.store.pipe(select(AgentsSelector.selectMgmtTable));
    error$ = this.store.pipe(select(AgentsSelector.selectError));

    saveAgents(agents: AgentUser[]) {
        this.store.dispatch(AgentsActions.saveAgents({ agents }));
    }

    retrieveAgentInfo(agents: TravelAgent[]) {
        this.store.dispatch(AgentsActions.retrieveAgentsInfo({ agents }));
    }

    saveAgentsManagementTable(mgmtTable: AgentsTableRow[]) {
        if (mgmtTable) {
            this.store.dispatch(AgentsActions.saveMgmtTableSuccess({ mgmtTable }));
        } else {
            this.store.dispatch(AgentsActions.saveMgmtTableFailure({ error: 'Error: Management Table is empty.' }));
        }
    }

    addAgent(newAgent: NewTravelAgent) {
        this.store.dispatch(AgentsActions.addAgent({ newAgent }));
    }

    updateAgent(agent: TravelAgent) {
        this.store.dispatch(AgentsActions.updateAgent({ agent }));
    }

    deleteAgent(id: string | number) {
        this.store.dispatch(AgentsActions.deleteAgent({ id }));
    }
}