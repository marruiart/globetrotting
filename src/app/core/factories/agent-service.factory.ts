import { BackendTypes } from "src/environments/environment";
import { DataService } from "../services/api/data.service";
import { MappingService } from "../services/api/mapping.service";
import { AgentService } from "../services/api/agent.service";
import { SubscribableAgentService } from "../services/api/subscribable-agent.service";
import { Backends } from "../utilities/utilities";

export function AgentServiceFactory(
    backend: BackendTypes,
    dataSvc: DataService,
    mappingSvc: MappingService
) {
    switch (backend) {
        case Backends.STRAPI:
            return new AgentService(dataSvc, mappingSvc);
        case Backends.FIREBASE:
            return new SubscribableAgentService(dataSvc, mappingSvc);
        default:
            throw new Error('Backend not implemented');
    }
}