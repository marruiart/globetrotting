import { Booking } from "../globetrotting/booking.interface"
import { ClientBooking, ClientFavDestination } from "../globetrotting/client.interface"
import { Role } from "../globetrotting/user.interface"

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