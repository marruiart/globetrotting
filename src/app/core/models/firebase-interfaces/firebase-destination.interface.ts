// PAYLOAD

export type NewFirebaseDestinationPayload = {
    name: string,
    type: string,
    keywords: string,
    image: any,
    price: number,
    description: string,
    fav: boolean
}

export type FirebaseDestinationPayload = {
    id: number | string
} & NewFirebaseDestinationPayload