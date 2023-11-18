export interface StrapiData<T> {
  id: number,
  attributes: T
}

export interface StrapiArrayResponse<T> {
  data: StrapiData<T>[],
  meta: {
    pagination: {
      page: number,
      pageSize: number,
      pageCount: number,
      total: number,
    }
  }
}

export interface StrapiResponse<T> {
  data: StrapiData<T>
}

export interface StrapiPayload<T> {
  data: T
}