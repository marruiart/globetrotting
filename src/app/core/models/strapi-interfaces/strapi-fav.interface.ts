import { StrapiClient } from "./strapi-client.interface";
import { StrapiResponse } from "./strapi-data.interface";
import { StrapiDestination } from "./strapi-destination.interface";

export interface StrapiFav {
    destination: StrapiResponse<StrapiDestination>,
    client?: StrapiResponse<StrapiClient>,
}