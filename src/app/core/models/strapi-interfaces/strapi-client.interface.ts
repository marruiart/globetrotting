import { StrapiBooking } from "./strapi-booking.interface";
import { StrapiArrayResponse, StrapiResponse } from "./strapi-data.interface";
import { StrapiFav } from "./strapi-fav.interface";
import { StrapiUserRoleResponse } from "./strapi-user.interface";

/**
 * Strapi client response interface
 * @property {StrapiResponse<StrapiUserRoleResponse> | number | string} user - Strapi user data as a response or user id (number) as payload 
 */
export interface StrapiClient {
    user: StrapiResponse<StrapiUserRoleResponse> | number | string
    bookings?: StrapiArrayResponse<StrapiBooking>,
    favorites?: StrapiArrayResponse<StrapiFav>,
}