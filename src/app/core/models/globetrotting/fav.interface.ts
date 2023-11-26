export interface Fav extends NewFav {
    id: number
}

export interface NewFav {
    destination_id?: number,
    client_id?: number
}