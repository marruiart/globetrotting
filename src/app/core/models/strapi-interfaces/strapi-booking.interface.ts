import { StrapiAgent } from "./strapi-agent.interface";
import { StrapiClient } from "./strapi-client.interface";
import { StrapiResponse } from "./strapi-data.interface";
import { StrapiDestination } from "./strapi-destination.interface";

/**
 * Strapi booking response interface
 */
export interface StrapiBooking {
    start: string | null,
    end: string | null,
    rating?: number,
    isActive?: boolean,
    isConfirmed?: boolean,
    travelers: number,
    /**
    * Strapi client data as a response or client id (number) as payload 
    */
    client: StrapiResponse<StrapiClient> | string | number,
    /**
    * Strapi agent data as a response or agent id (number) as payload 
    */
    agent?: StrapiResponse<StrapiAgent> | string | number,
    /**
    * Strapi destination data as a response or destination id (number) as payload 
    */
    destination: StrapiResponse<StrapiDestination> | string | number,
}