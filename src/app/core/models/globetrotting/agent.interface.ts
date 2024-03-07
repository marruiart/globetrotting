import { Booking } from "./booking.interface";
import { PaginatedData } from "./pagination-data.interface";

/**
 * Represents the payload required for user registration in Strapi.
 * @property {number | string} id - The travel agent id.
 * @property {number | string} user_id - The related user id.
 * @property {Booking[]} bookings - That travel agent bookings.
 */
export type TravelAgent = NewTravelAgent & {
    id: number | string
}

export type NewTravelAgent = {
    user_id: number | string,
    bookings: Booking[]
}

export type PaginatedAgent = PaginatedData<TravelAgent>

export interface AgentsTableRow {
    ext_id?: number | string,
    user_id: number | string,
    username: string,
    nickname: string,
    name: string,
    surname: string,
    email: string
}