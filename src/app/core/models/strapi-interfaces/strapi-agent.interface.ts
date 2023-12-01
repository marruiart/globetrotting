import { StrapiBooking } from "./strapi-booking.interface";
import { StrapiArrayResponse, StrapiResponse } from "./strapi-data.interface";
import { StrapiDataUser } from "./strapi-user.interface";

/**
 * Strapi agent response interface
 */
export interface StrapiAgent {
    bookings: StrapiArrayResponse<StrapiBooking>,
    user: StrapiResponse<StrapiDataUser>
}