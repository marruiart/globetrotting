import { PaginatedData } from "./pagination-data.interface"

export interface Booking extends NewBooking {
    id: number
}

export interface NewBooking {
    start: string,
    end: string,
    rating: number | null,
    isActive: boolean,
    isConfirmed: boolean,
    travelers: number
}

export type PaginatedBooking = PaginatedData<Booking>