export interface Pagination {
    prev: number | null,
    page: number,
    next: number | null,
    pageSize: number,
    pageCount: number,
    total: number
}
export interface PaginatedData<T> {
    data: T[],
    pagination: Pagination
}

export let emptyPaginatedData: PaginatedData<any> = {
    data: [],
    pagination: {
        prev: null,
        page: 0,
        next: null,
        pageSize: 0,
        pageCount: 0,
        total: 0
    }
}