import { Booking } from "./booking.interface";
import { Destination, DestinationId } from "./destination.interface";
import { PaginatedData } from "./pagination-data.interface";

export interface Client extends NewClient {
    id: number,
}

export interface NewClient {
    bookings: Booking[],
    favorites: DestinationId[]
}

export type PaginatedClient = PaginatedData<Client>