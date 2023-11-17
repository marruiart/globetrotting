import { Media } from "./media"

export interface NewUser {
    nickname: string,
    avatar?: Media,
    name?: string,
    surname?: string,
    age?: string,
    user_id: number
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

export interface User extends NewUser {
    id: number
}

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