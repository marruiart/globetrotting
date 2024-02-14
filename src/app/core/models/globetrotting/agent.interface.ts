import { Booking } from "./booking.interface";
import { PaginatedData } from "./pagination-data.interface";

/**
 * Represents the payload required for user registration in Strapi.
 * @property {number | string} id - The travel agent id.
 * @property {number | string} user_id - The related user id.
 * @property {Booking[]} bookings - That travel agent bookings.
 */
export interface TravelAgent extends NewTravelAgent {
    id: number | string
}

export interface NewTravelAgent {
    user_id: number | string,
    bookings: Booking[]
}

export type PaginatedAgent = PaginatedData<TravelAgent>

export interface AgentsTableRow {
    agent_id: number | string,
    name: string,
    surname: string,
    email: string
  }