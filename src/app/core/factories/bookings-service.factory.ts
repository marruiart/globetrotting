import { DataService } from "../services/api/data.service";
import { MappingService } from "../services/api/mapping.service";
import { BookingsService } from "../services/api/bookings.service";
import { SubscribableBookingsService } from "../services/api/subscribable-bookings.service";
import { BackendTypes, Backends } from "../utilities/utilities";

export function BookingsServiceFactory(
    backend: BackendTypes,
    dataSvc: DataService,
    mappingSvc: MappingService
) {
    switch (backend) {
        case Backends.STRAPI:
            return new BookingsService(dataSvc, mappingSvc);
        case Backends.FIREBASE:
            return new SubscribableBookingsService(dataSvc, mappingSvc);
        default:
            throw new Error('Backend not implemented');
    }
}