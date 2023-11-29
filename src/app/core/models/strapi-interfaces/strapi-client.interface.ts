import { StrapiBooking } from "./strapi-booking.interface";
import { StrapiArrayResponse, StrapiData } from "./strapi-data.interface";
import { StrapiFav } from "./strapi-fav.interface";
import { StrapiDataUser } from "./strapi-user.interface";

/**
 * Strapi client response interface
 */
export interface StrapiClient {
    bookings: StrapiArrayResponse<StrapiBooking>,
    favorites: StrapiArrayResponse<StrapiFav>,
    user_id?: StrapiData<StrapiDataUser>
}