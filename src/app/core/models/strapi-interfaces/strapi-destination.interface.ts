import { LatLng } from "@capacitor/google-maps/dist/typings/definitions"
import { StrapiResponse } from "./strapi-data.interface"
import { StrapiMedia } from "./strapi-media.interface"

/**
 * Strapi destination response interface
 */
export interface StrapiDestination {
  name: string
  type?: string
  dimension?: string
  description?: string,
  coordinate?: LatLng,
  image?: StrapiResponse<StrapiMedia>
  price?: any
}