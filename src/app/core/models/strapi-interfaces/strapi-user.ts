import { StrapiMedia } from "./strapi-media";
import { StrapiResponse } from "./strapi-data";

export interface StrapiUser {
    id: number,
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
    name: string,
    surname: string,
    age: string,
    user_id: number,
    avatar?: StrapiResponse<StrapiMedia>
}