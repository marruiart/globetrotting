import { Destination } from "./destination.interface"
import { PaginatedData } from "./pagination-data.interface"

export interface Booking extends NewBooking {
    id: number | string
}

/**
 * @property {string | null} start - 
 * @property {string | null} end - 
 * @property {number} travelers - 
 * @property {number} [rating] - 
 * @property {boolean} [isActive] - 
 * @property {boolean} [isConfirmed] - Confirmation of the booking. If the booking is created by an agent, it is true. If it is created by a client, it is by default false.
 * @property {string | number} [agent_id] - The id of the user (from user permissions) related to that agent.
 * @property {string | number} client_id - The id of the user (from user permissions) related to that client.
 * @property {string | number} destination_id - 
 * @property {string} destinationName - 
 */
export interface NewBooking {
    start: string | null,
    end: string | null,
    travelers: number,
    rating?: number,
    isActive?: boolean,
    isConfirmed?: boolean,
    agent_id?: string | number,
    agentName?: string | null,
    client_id: string | number,
    clientName?: string,
    destination_id: string | number,
    destinationName?: string
}

export interface BookingForm {
    client_id?: string | number,
    destination_id?: string | number,
    start: string,
    end: string,
    travelers: number
}

export type PaginatedBooking = PaginatedData<Booking>

export type BookingsTableRow = ClientBookingsTableRow | AgentBookingsTableRow | AdminBookingsTableRow

type TableRow = {
    booking_id: number | string,
    destination_id: number | string,
    destinationName: string,
    start: string | null,
    end: string | null,
    travelers: number,
    isConfirmed: boolean
}

export type ClientBookingsTableRow = TableRow & AgentRowInfo

export type AgentBookingsTableRow = TableRow & ClientRowInfo

export type AdminBookingsTableRow = TableRow & AgentRowInfo & ClientRowInfo

export type AgentRowInfo = {
    agent_id: number | string | null
    agentName: string | null
}

export type ClientRowInfo = {
    client_id: number | string | null
    clientName: string
}

export interface ClientBooking {
    booking_id: number | string
}