import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as AgentsActions from './agents.actions'
import * as AgentsSelector from './agents.selectors'
import { AgentsTableRow } from "../../models/globetrotting/user.interface";
import { NewTravelAgent, PaginatedAgent, TravelAgent } from "../../models/globetrotting/agent.interface";

@Injectable()
export class AgentsFacade {

    private readonly store = inject(Store);
    agents$ = this.store.pipe(select(AgentsSelector.selectAgents));
    agentsPage$ = this.store.pipe(select(AgentsSelector.selectPage));
    agentTable$ = this.store.pipe(select(AgentsSelector.selectManagementTable));
    error$ = this.store.pipe(select(AgentsSelector.selectError));

    saveAgents(agents: TravelAgent[]) {
        if (agents) {
            this.store.dispatch(AgentsActions.saveAgents({ agents }));
        }
    }

    savePaginatedAgents(agentsPage: PaginatedAgent) {
        if (agentsPage) {
            this.store.dispatch(AgentsActions.savePage({ agentsPage }));
        }
    }

    saveAgentsManagementTable(managementTable: AgentsTableRow[]) {
        if (managementTable) {
            this.store.dispatch(AgentsActions.saveManagementTable({ managementTable }));
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