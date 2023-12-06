import { TravelAgent } from "./agent.interface"
import { Client } from "./client.interface"
import { Media } from "./media.interface"
import { PaginatedData } from "./pagination-data.interface"

export interface User extends NewUser {
    id: number
}
export interface NewUser {
    nickname: string,
    avatar?: Media,
    name?: string,
    surname?: string,
    age?: string,
    user_id?: number
}

/* interface Media {
    id: number,
    attributes: {
        name: string,
        alternativeText: string | null,
        caption: string | null,
        width: number,
        height: number,
        formats: {}
    }
} */

export type PaginatedUser = PaginatedData<User>

export interface UserCredentials {
    username: string,
    password: string
}

export interface UserRegisterInfo {
    email: string,
    username: string,
    password: string,
    name?: string,
    surname?: string,
    nickname?: string
}

export interface AgentRegisterInfo extends UserRegisterInfo {
    id: number,
    name: string,
    surname: string,
    nickname: string
}

export interface FullUser {
    user?: UserCredentials | null
    extendedUser: User | null
    specificUser: Client | TravelAgent | null
}