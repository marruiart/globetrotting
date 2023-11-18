import { Media } from "./media";
import { PaginatedData } from "./pagination-data";

export interface Destination extends NewDestination {
    id: number
}

export interface NewDestination {
    name: string,
    type?: string,
    dimension?: string,
    image?: Media,
    price?: number,
    description?: string
}

export type PaginatedDestination = PaginatedData<Destination>

export let emptyDestination: Destination = {
    id: 0,
    name: "",
    type: "",
    dimension: "",
    image: undefined,
    price: 0,
    description: ""
}