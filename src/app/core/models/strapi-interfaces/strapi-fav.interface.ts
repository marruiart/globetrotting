import { StrapiClient } from "./strapi-client.interface";
import { StrapiData } from "./strapi-data.interface";
import { StrapiDestination } from "./strapi-destination.interface";

export interface StrapiFav {
    destination: StrapiData<StrapiDestination>,
    client: StrapiData<StrapiClient>,
}