import { LatLng } from "@capacitor/google-maps/dist/typings/definitions";
import { Media } from "./media.interface";
import { PaginatedData } from "./pagination-data.interface";

export interface Destination extends NewDestination {
    id: number | string
}

export interface NewDestination {
    name: string,
    type?: string,
    dimension?: string,
    image?: Media,
    price?: number,
    description?: string,
    fav?: boolean,
    coordinate: LatLng
}

export type PaginatedDestination = PaginatedData<Destination>

export interface DestinationsTableRow {
    id: number | string,
    name: string,
    type?: string,
    dimension?: string,
    price?: number,
    description?: string
  }