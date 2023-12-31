import { Destination } from "./destination.interface"
import { PaginatedData } from "./pagination-data.interface"

export interface Booking extends NewBooking {
    id: number
}

export interface NewBooking {
    start: string | null,
    end: string | null,
    travelers: number,
    rating?: number,
    isActive?: boolean,
    /**
     * Confirmation of the booking. If the booking is created by an agent, it is true. If it is 
     * created by a client, it is by default false.  
     */
    isConfirmed?: boolean,
    agent_id?: number,
    client_id: number,
    destination_id: number
}

export interface BookingForm {
    client_id?: number,
    destination_id?: number,
    start: string,
    end: string,
    travelers: number
}

export type PaginatedBooking = PaginatedData<Booking>