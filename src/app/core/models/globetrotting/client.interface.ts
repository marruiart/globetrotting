import { PaginatedData } from "./pagination-data.interface";

export interface Client extends NewClient {
    id: number
}

export interface NewClient {
    type: 'AUTHENTICATED',
    user_id: number,
    bookings: ClientBooking[],
    favorites: ClientFavDestination[]
}

export type PaginatedClient = PaginatedData<Client>

export interface ClientFavDestination {
    fav_id: number,
    destination_id: number
}

export interface ClientBooking {
    booking_id: number
}