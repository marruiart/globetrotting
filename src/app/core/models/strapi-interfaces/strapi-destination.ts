import { StrapiResponse } from "./strapi-data"
import { StrapiMedia } from "./strapi-media"

export interface StrapiDestination {
  id?: number,
  name: string
  type?: string
  dimension?: string
  description?: string
  image?: StrapiResponse<StrapiMedia>
  price?: any
}