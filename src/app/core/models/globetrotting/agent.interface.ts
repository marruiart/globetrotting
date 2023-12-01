import { Booking } from "./booking.interface";
import { PaginatedData } from "./pagination-data.interface";

export interface TravelAgent extends NewAgent {
    id: number,
    user_id: number,
    type: 'AGENT'
}

export interface NewAgent {
    bookings: Booking[]
}

export type PaginatedAgent = PaginatedData<TravelAgent>