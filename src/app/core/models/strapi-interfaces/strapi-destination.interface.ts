import { StrapiResponse } from "./strapi-data.interface"
import { StrapiMedia } from "./strapi-media.interface"

/**
 * Strapi destination response interface
 */
export interface StrapiDestination {
  name: string
  type?: string
  dimension?: string
  description?: string
  image?: StrapiResponse<StrapiMedia>
  price?: any
}