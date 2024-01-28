import { Backend, Firebase } from "src/environments/environment"
import { TravelAgent } from "./agent.interface"
import { Client } from "./client.interface"
import { Media } from "./media.interface"
import { PaginatedData } from "./pagination-data.interface"
import { FirebaseUserCredentials, FirebaseUserRegisterInfo } from "../firebase-interfaces/firebase-user.interface"
import { StrapiUserCredentials, StrapiUserRegisterInfo } from "../strapi-interfaces/strapi-user.interface"

export type Role = 'ADMIN' | 'AGENT' | 'AUTHENTICATED';

// Options depending on the implemented backend possibilities.
export type UserCredentialsOptions = FirebaseUserCredentials | StrapiUserCredentials;
export type UserRegisterInfoOptions = FirebaseUserRegisterInfo | StrapiUserRegisterInfo;
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

export type UserCredentials = Backend extends Firebase ? FirebaseUserCredentials : StrapiUserCredentials;
export type UserRegisterInfo = Backend extends Firebase ? FirebaseUserRegisterInfo : StrapiUserRegisterInfo;

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
    user: StrapiUserCredentials | null
    extendedUser: ExtUser | null
    specificUser: Client | TravelAgent | null
}