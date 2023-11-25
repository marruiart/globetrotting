import { StrapiResponse } from "./strapi-data.interface"
import { StrapiMedia } from "./strapi-media.interface"

export interface StrapiDestination {
  name: string
  type?: string
  dimension?: string
  description?: string
  image?: StrapiResponse<StrapiMedia>
  price?: any
}