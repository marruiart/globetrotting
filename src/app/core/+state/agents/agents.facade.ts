import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as AgentsActions from './agents.actions'
import * as AgentsSelector from './agents.selectors'
import { NewTravelAgent, TravelAgent } from "../../models/globetrotting/agent.interface";
import { AgentUser } from "../../models/globetrotting/user.interface";

@Injectable()
export class AgentsFacade {

    private readonly store = inject(Store);
    agentTable$ = this.store.pipe(select(AgentsSelector.selectMgmtTable));
    error$ = this.store.pipe(select(AgentsSelector.selectError));

    initAgents() {
        this.store.dispatch(AgentsActions.initAgents());
    }

    retrieveAgentInfo(agents: TravelAgent[]) {
        this.store.dispatch(AgentsActions.retrieveAgentsInfo({ agents }));
    }
    
    saveAgents(agents: AgentUser[]) {
        this.store.dispatch(AgentsActions.saveAgents({ agents }));
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