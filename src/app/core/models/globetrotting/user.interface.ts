import { TravelAgent } from "./agent.interface"
import { Client } from "./client.interface"
import { Media } from "./media.interface"
import { PaginatedData } from "./pagination-data.interface"

export interface ExtUser extends NewExtUser {
    id: number
}
export interface NewExtUser {
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

export type PaginatedExtUser = PaginatedData<ExtUser>

export interface UserCredentials {
    /**
     * id of the User-Permissions table
     */
    id?: number,
    username: string,
    email?: string,
    password: string | null
}

export interface UserRegisterInfo extends UserCredentials {
    email: string
}

export interface AgentRegisterInfo extends UserRegisterInfo {
    /**
     * id of the Agent table
     */
    id: number,
    name: string,
    surname: string,
    nickname: string
}

export interface FullUser {
    user?: UserCredentials | null
    extendedUser: ExtUser | null
    specificUser: Client | TravelAgent | null
}