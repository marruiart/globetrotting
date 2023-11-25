import { Media } from "./media.interface";
import { PaginatedData } from "./pagination-data.interface";

export interface Destination extends NewDestination {
    id: number
}

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

export let emptyDestination: Destination = {
    id: 0,
    name: ""
}