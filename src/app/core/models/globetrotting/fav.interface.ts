export interface Fav extends NewFav {
    id: number | string
}

/**
 * @property {number | string} [destination_id] The related destination id, admits nullable in case the field is not populated.
 * @property {number | string} [client_id] The related client id, admits nullable in case the field is not populated.
 */
export interface NewFav {
    destination_id?: number | string,
    client_id?: number | string
}