import { BackendTypes } from "src/environments/environment";
import { DataService } from "../services/api/data.service";
import { MappingService } from "../services/api/mapping.service";
import { UsersService } from "../services/api/users.service";
import { SubscribableUsersService } from "../services/api/subscribable-users.service";
import { Backends } from "../utilities/utilities";

export function UsersServiceFactory(
    backend: BackendTypes,
    dataSvc: DataService,
    mappingSvc: MappingService
) {
    switch (backend) {
        case Backends.STRAPI:
            return new UsersService(dataSvc, mappingSvc);
        case Backends.FIREBASE:
            return new SubscribableUsersService(dataSvc, mappingSvc);
        default:
            throw new Error('Backend not implemented');
    }
}