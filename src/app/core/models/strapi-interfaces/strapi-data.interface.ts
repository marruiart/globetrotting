import { StrapiDestination } from "./strapi-destination.interface"
import { StrapiPagination } from "./strapi-pagination.interface"

export interface StrapiData<T> {
  id: number,
  attributes: T
}

export interface StrapiArrayResponse<T> {
  data: StrapiData<T>[],
  meta: {
    pagination: StrapiPagination
  }
}

export interface StrapiResponse<T> {
  data: StrapiData<T>
}

export interface StrapiPayload<T> {
  data: T
}

export type StrapiDestinationResponse = StrapiResponse<StrapiDestination>