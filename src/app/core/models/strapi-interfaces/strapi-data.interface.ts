import { StrapiDestination } from "./strapi-destination.interface"
import { StrapiPagination } from "./strapi-pagination.interface"

/**
 * Strapi generic data response interface
 */
export interface StrapiData<T> {
  id: number,
  attributes: T
}

/**
 * Strapi generic multiple data (array) response interface
 */
export interface StrapiArrayResponse<T> {
  data: StrapiData<T>[],
  meta: {
    pagination: StrapiPagination
  }
}

/**
 * Strapi generic response interface
 */
export interface StrapiResponse<T> {
  data: StrapiData<T>
}

/**
 * Strapi generic data payload interface
 */
export interface StrapiPayload<T> {
  data: T
}

export type StrapiDestinationResponse = StrapiResponse<StrapiDestination>