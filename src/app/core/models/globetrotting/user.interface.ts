import { Role } from "../../utilities/utilities"
import { FirebaseUserCredentials, FirebaseUserRegisterInfo } from "../firebase-interfaces/firebase-user.interface"
import { StrapiUserCredentials, StrapiUserRegisterInfo } from "../strapi-interfaces/strapi-user.interface"
import { TravelAgent } from "./agent.interface"
import { Client } from "./client.interface"
import { ClientFavDestination } from "./fav.interface"
import { Media } from "./media.interface"
import { PaginatedData } from "./pagination-data.interface"

// Options depending on the implemented backend possibilities.
export type UserCredentialsOptions = FirebaseUserCredentials | StrapiUserCredentials;
export type UserRegisterInfoOptions = FirebaseUserRegisterInfo | StrapiUserRegisterInfo;
export interface ExtUser extends NewExtUser {
    id: number | string
}
export interface NewExtUser {
    nickname: string,
    avatar?: Media,
    name?: string,
    surname?: string,
    age?: string,
    user_id?: number | string
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

/**
 * Represents a user.
 * @property {Role} role - 'AUTHENTICATED', 'ADMIN' or 'AGENT' role.
 * @property {string | number} user_id - Identification of the user.
 * @property {string | number} [ext_id] - Identification of the extended user (optional).
 * @property {string | number} [specific_id] - Identification of the specific user (optional).
 * @property {string} username - The username associated with the user's account.
 * @property {string} email - The email address associated with the user's account.
 * @property {string} nickname - The nickname of the user.
 * @property {string} [avatar] - The avatar of the user (optional).
 * @property {string} [name] - The name of the user (optional).
 * @property {string} [surname] - The surname of the user (optional).
 * @property {string} [age] - The birth date of the user (optional).
 */
export type User = {
    role: Role,
    user_id: string | number,
    ext_id?: string | number,
    specific_id?: string | number,
    username: string,
    email: string,
    nickname: string,
    avatar?: any,
    name?: string,
    surname?: string,
    age?: string,
}

/**
 * Represents a client user.
 * @property {'AUTHENTICATED'} role - 'AUTHENTICATED' role.
 * @property {string | number} user_id - Identification of the user.
 * @property {string | number} [ext_id] - Identification of the extended user (optional).
 * @property {string | number} [specific_id] - Identification of the specific user (optional).
 * @property {string} username - The username associated with the user's account.
 * @property {string} email - The email address associated with the user's account.
 * @property {string} nickname - The nickname of the user.
 * @property {string} [avatar] - The avatar of the user (optional).
 * @property {string} [name] - The name of the user (optional).
 * @property {string} [surname] - The surname of the user (optional).
 * @property {string} [age] - The birth date of the user (optional).
 * @property {ClientFavDestination[]} favorites - An array of the favorite destinations of the user.
 */
export interface ClientUser extends User {
    role: 'AUTHENTICATED',
    favorites: ClientFavDestination[]
}

/**
 * Represents an agent user.
 * @property {'AGENT'} role - 'AGENT' or 'ADMIN' role.
 * @property {string | number} user_id - Identification of the user.
 * @property {string | number} [ext_id] - Identification of the extended user (optional).
 * @property {string | number} [specific_id] - Identification of the specific user (optional).
 * @property {string} username - The username associated with the user's account.
 * @property {string} email - The email address associated with the user's account.
 * @property {string} nickname - The nickname of the user.
 * @property {string} [avatar] - The avatar of the user (optional).
 * @property {string} name - The name of the user.
 * @property {string} surname - The surname of the user.
 * @property {string} [age] - The birth date of the user (optional).
 */
export interface AgentUser extends User {
    role: 'AGENT',
    name: string,
    surname: string,
}

/**
 * Represents an agent user.
 * @property {'ADMIN'} role - 'AGENT' or 'ADMIN' role.
 * @property {string | number} user_id - Identification of the user.
 * @property {string | number} [ext_id] - Identification of the extended user (optional).
 * @property {string | number} [specific_id] - Identification of the specific user (optional).
 * @property {string} username - The username associated with the user's account.
 * @property {string} email - The email address associated with the user's account.
 * @property {string} nickname - The nickname of the user.
 * @property {string} [avatar] - The avatar of the user (optional).
 * @property {string} name - The name of the user.
 * @property {string} surname - The surname of the user.
 * @property {string} [age] - The birth date of the user (optional).
 */
export interface AdminUser extends User {
    role: 'ADMIN',
    name: string,
    surname: string,
}

export type AdminAgentOrClientUser = AdminUser | AgentUser | ClientUser