export interface Fav extends NewFav {
    id: number
}

export interface NewFav {
    /**
     * Is the related destination id, admits nullable in case the field is not populated
     */
    destination_id?: number,
    /**
     * Is the related client id, admits nullable in case the field is not populated
     */
    client_id?: number
}