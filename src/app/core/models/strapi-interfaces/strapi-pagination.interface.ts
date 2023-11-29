/**
 * Strapi generic pagination response interface
 */
export interface StrapiPagination {
    page: number,
    pageSize: number,
    pageCount: number,
    total: number
}