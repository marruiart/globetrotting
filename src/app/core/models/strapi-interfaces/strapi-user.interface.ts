import { StrapiMedia } from "./strapi-media.interface";
import { StrapiResponse } from "./strapi-data.interface";
import { Role } from "../globetrotting/user.interface";

export interface StrapiUserCredentials {
    /**
     * id of the User-Permissions table
     */
    id?: number,
    username: string,
    email?: string,
    password: string | null
}

export interface StrapiUserRegisterInfo {
    username: string,
    email: string,
    password: string | null
}

export interface StrapiAuthUser {
    user_id: number,
    role: Role
}

export interface StrapiUser extends StrapiDataUser {
    id: number
}

export interface StrapiDataUser {
    username: string,
    email: string
}

export interface StrapiMe extends StrapiUser {
    role: {
        type: string
    }
}

export interface StrapiLoginPayload {
    identifier: string,
    password: string
}

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

export interface StrapiExtendedUser {
    nickname: string,
    name?: string,
    surname?: string,
    age?: string,
    /**
    * Strapi user data as a response or user id (number) as payload 
    */
    user?: StrapiResponse<StrapiUser> | number,
    avatar: StrapiResponse<StrapiMedia> | null
}