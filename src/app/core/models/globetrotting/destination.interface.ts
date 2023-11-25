import { Media } from "./media.interface";
import { PaginatedData } from "./pagination-data.interface";


export interface DestinationId {
    id: number
}
export interface Destination extends NewDestination, DestinationId {}

export interface NewDestination {
    name: string,
    type?: string,
    dimension?: string,
    image?: Media,
    price?: number,
    description?: string,
    fav?: boolean
}

export type PaginatedDestination = PaginatedData<Destination>