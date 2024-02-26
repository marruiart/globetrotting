import { StrapiBooking } from "./strapi-booking.interface";
import { StrapiArrayResponse, StrapiResponse } from "./strapi-data.interface";
import { StrapiUserRoleResponse } from "./strapi-user.interface";

/**
 * Strapi agent response interface
 */
export interface StrapiAgent {
    /**
    * Strapi user data as a response or user id (number) as payload 
    */
    user: StrapiResponse<StrapiUserRoleResponse> | number | string
    bookings?: StrapiArrayResponse<StrapiBooking>,
}