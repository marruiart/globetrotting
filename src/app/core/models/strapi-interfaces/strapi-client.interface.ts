import { StrapiBooking } from "./strapi-booking.interface";
import { StrapiData } from "./strapi-data.interface";
import { StrapiFav } from "./strapi-fav.interface";
import { StrapiDataUser } from "./strapi-user.interface";

export interface StrapiClient {
    bookings: StrapiData<StrapiBooking>,
    favorites: StrapiData<StrapiFav>,
    user_id: StrapiData<StrapiDataUser>
}