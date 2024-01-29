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

/**
 * Represents the credentials required for user authentication.
 * @property {string} [username] - The username associated with the user's account (optional).
 * @property {string} [email] - The email address associated with the user's account (optional).
 * @property {string | null} password - The user's password for authentication.
 */
export type UserCredentials = {
    username?: string,
    email?: string,
    password: string | null
}

/**
 * Represents the credentials required for user registration.
 * @property {string} username - The username associated with the user's account.
 * @property {string} email - The email address associated with the user's account.
 * @property {string | null} password - The user's password for registration.
 */
export type UserRegisterInfo = {
    username: string,
    email: string,
    password: string | null
}

/**
 * Represents the credentials required for agents registration.
 * @extends {UserRegisterInfo}
 * @property {number} id - Identification field from the Agent table.
 * @property {string} username - The username associated with the agent's account.
 * @property {string} email - The email address associated with the agent's account.
 * @property {string | null} password - The agent's password for registration.
 */
export interface AgentRegisterInfo extends UserRegisterInfo {
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