import { Media } from "./media";

export interface Destination extends NewDestination {
    id: number,
    price?: number,
    description?: string
}

export interface NewDestination {
    name: string,
    type?: string,
    dimension?: string,
    image?: Media,
}