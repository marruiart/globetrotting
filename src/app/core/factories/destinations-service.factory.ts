import { DataService } from "../services/api/data.service";
import { MappingService } from "../services/api/mapping.service";
import { SubscribableDestinationsService } from "../services/api/subscribable-destinations.service";
import { DestinationsService } from "../services/api/destinations.service";
import { Backend, Backends } from "../utilities/utilities";

export function DestinationsServiceFactory(
    backend: Backend,
    dataSvc: DataService,
    mappingSvc: MappingService
) {
    switch (backend) {
        case Backends.STRAPI:
            return new DestinationsService(dataSvc, mappingSvc);
        case Backends.FIREBASE:
            return new SubscribableDestinationsService(dataSvc, mappingSvc);
        default:
            throw new Error('Backend not implemented');
    }
}