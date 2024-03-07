import { Timestamp } from "firebase/firestore"
import { Role } from "../../utilities/utilities"
import { Booking, ClientBooking } from "../globetrotting/booking.interface"
import { ClientFavDestination } from "../globetrotting/fav.interface"

export interface FirebaseUserCredentials {
    email: string,
    password: string | null
}

export interface FirebaseUserRegisterInfo {
    username: string,
    email: string,
    password: string | null
}

export interface FirebaseAuthUser {
    uid: string,
    role: Role,
    nickname: string,
    email: string,
    avatar?: any,
    name?: string,
    surname?: string,
    age?: string,
    bookings?: ClientBooking[] | Booking[],
    favorites?: ClientFavDestination[]
}

// PAYLOAD

export type NewFirebaseUserPayload = {
    user_id: string,
    role: Role,
    email: string,
    username: string,
    nickname: string,
    name?: string,
    surname?: string,
    favorites?: ClientFavDestination[],
    createdAt?: Timestamp
}

export type FirebaseUserPayload = {
    avatar?: any,
    age?: string,
    updatedAt?: Timestamp
} & NewFirebaseUserPayload