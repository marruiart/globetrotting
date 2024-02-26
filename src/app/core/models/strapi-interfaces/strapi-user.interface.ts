import { StrapiMedia } from "./strapi-media.interface";
import { StrapiResponse } from "./strapi-data.interface";
import { Role } from "../globetrotting/user.interface";

export interface StrapiRole {
    id: number,
    name: string,
    description: string,
    type: string
}

export interface StrapiRolesResponse {
    roles: StrapiRole[]
}

/**
 * Represents the credentials of a user in Strapi.
 * @property {number} [id] - The unique identifier for the user from the user-permissions table.
 * @property {string} username - The username.
 * @property {string} [email] - The email.
 * @property {string} password - The user's password for authentication.
 * @property {string} [role] - The role of the user: 'AUTHENTICATED', 'ADMIN' or 'AGENT'.
 */
export interface StrapiUserCredentials {
    id?: number,
    username: string,
    email?: string,
    password: string | null,
    role?: Role
}

export interface StrapiUserRegisterInfo {
    username: string,
    email: string,
    password: string | null
}

export interface StrapiUserRoleResponse {
    id: number,
    username: string,
    email: string,
    role: StrapiResponse<StrapiRole>
}

export interface StrapiUser {
    id: number,
    username: string,
    email: string,
    role: StrapiRole
}

/**
 * Represents the payload required for user authentication in Strapi.
 * @property {string} identifier - The unique identifier for the user, could be an email or username.
 * @property {string} password - The user's password for authentication.
 */
export interface StrapiLoginPayload {
    identifier: string,
    password: string
}

/**
 * Represents the payload required for user registration in Strapi.
 * @property {string} username - The desired username for the new user account.
 * @property {string} email - The email address associated with the new user account.
 * @property {string} password - The password chosen for the new user account.
 */
export interface StrapiRegisterPayload {
    username: string
    email: string,
    password: string,
}

export interface StrapiLoginResponse {
    jwt: string,
    user: StrapiUser
}

export type StrapiRegisterResponse = StrapiLoginResponse;

/**
 * @property {StrapiResponse<StrapiDataUser> | number | string} user - Strapi user data as a response or user id (number) as payload.
 */
export interface StrapiExtendedUser {
    nickname: string,
    name?: string,
    surname?: string,
    age?: string,
    user?: StrapiResponse<StrapiUserRoleResponse> | number | string,
    avatar: StrapiResponse<StrapiMedia> | null
}