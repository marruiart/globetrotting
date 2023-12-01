import { StrapiBooking } from "./strapi-booking.interface";
import { StrapiArrayResponse, StrapiResponse } from "./strapi-data.interface";
import { StrapiFav } from "./strapi-fav.interface";
import { StrapiDataUser } from "./strapi-user.interface";

/**
 * Strapi client response interface
 */
export interface StrapiClient {
    bookings: StrapiArrayResponse<StrapiBooking>,
    favorites: StrapiArrayResponse<StrapiFav>,
    /**
    * Strapi user data as a response or user id (number) as payload 
    */
    user: StrapiResponse<StrapiDataUser> | number
}