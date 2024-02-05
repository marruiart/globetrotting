import { PaginatedData } from "./pagination-data.interface";

export interface Client extends NewClient {
    id: number | string
}

export interface NewClient {
    type: 'AUTHENTICATED',
    user_id: number | string,
    bookings: ClientBooking[],
    favorites: ClientFavDestination[]
}

export type PaginatedClient = PaginatedData<Client>

export interface ClientFavDestination {
    fav_id: number | string,
    destination_id: number | string
}

export interface ClientBooking {
    booking_id: number | string
}