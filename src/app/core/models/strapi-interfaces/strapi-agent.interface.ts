import { StrapiBooking } from "./strapi-booking.interface";
import { StrapiArrayResponse, StrapiData } from "./strapi-data.interface";
import { StrapiDataUser } from "./strapi-user.interface";

export interface StrapiAgent {
    bookings: StrapiArrayResponse<StrapiBooking>,
    user_id: StrapiData<StrapiDataUser>
}