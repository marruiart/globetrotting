import { BackendTypes } from "src/environments/environment";
import { DataService } from "../services/api/data.service";
import { MappingService } from "../services/api/mapping.service";
import { BookingsService } from "../services/api/bookings.service";
import { SubscribableBookingsService } from "../services/api/subscribable-bookings.service";

export function BookingsServiceFactory(
    backend: BackendTypes,
    dataSvc: DataService,
    mappingSvc: MappingService
) {
    switch (backend) {
        case 'Strapi':
            return new BookingsService(dataSvc, mappingSvc);
        case 'Firebase':
            return new SubscribableBookingsService(dataSvc, mappingSvc);
        default:
            throw new Error('Backend not implemented');
    }
}