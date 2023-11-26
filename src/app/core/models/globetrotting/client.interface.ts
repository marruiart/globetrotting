import { Booking } from "./booking.interface";
import { FavDestination } from "./destination.interface";
import { PaginatedData } from "./pagination-data.interface";

export interface Client extends NewClient {
    id: number,
    type: 'AUTHENTICATED'
}

export interface NewClient {
    bookings: Booking[],
    favorites: FavDestination[]
}

export type PaginatedClient = PaginatedData<Client>