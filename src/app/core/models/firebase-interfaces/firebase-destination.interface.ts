// PAYLOAD

export type NewFirebaseDestinationPayload = {
    name: string,
    type: string,
    dimension: string,
    image: any,
    price: number,
    description: string,
    fav: boolean
}

export type FirebaseDestinationPayload = {
    id: number | string
} & NewFirebaseDestinationPayload