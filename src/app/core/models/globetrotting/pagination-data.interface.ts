export interface Pagination {
    page: number,
    pageSize: number,
    pageCount: number,
    total: number
}
export interface PaginatedData<T> {
    data: T[],
    pagination: Pagination
}

export let emptyPaginatedData:PaginatedData<any> = {
    data: [],
    pagination: {
        page: 0,
        pageSize: 0,
        pageCount: 0,
        total: 0
    }
}