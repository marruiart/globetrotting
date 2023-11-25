import { Booking } from "./booking.interface";
import { PaginatedData } from "./pagination-data.interface";

export interface Agent extends NewAgent {
    id: number,
}

export interface NewAgent {
    bookings: Booking[]
}

export type PaginatedAgent = PaginatedData<Agent>