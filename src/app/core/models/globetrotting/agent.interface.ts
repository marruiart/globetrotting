import { Booking } from "./booking.interface";
import { PaginatedData } from "./pagination-data.interface";

export interface TravelAgent extends NewTravelAgent {
    id: number
}

export interface NewTravelAgent {
    user_id: number,
    bookings: Booking[]
}

export type PaginatedAgent = PaginatedData<TravelAgent>