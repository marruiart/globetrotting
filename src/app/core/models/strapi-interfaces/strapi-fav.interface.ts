import { StrapiClient } from "./strapi-client.interface";
import { StrapiResponse } from "./strapi-data.interface";
import { StrapiDestination } from "./strapi-destination.interface";

/**
 * Strapi favorite interface
 */
export interface StrapiFav {
    /**
    * Strapi destination data as a response or destination id (number) as payload 
    */
    destination: StrapiResponse<StrapiDestination> | number,
    /**
    * Strapi client data as a response or client id (number) as payload 
    */
    client?: StrapiResponse<StrapiClient> | number,
}