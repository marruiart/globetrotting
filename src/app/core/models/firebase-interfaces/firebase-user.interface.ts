import { Role } from "../globetrotting/user.interface"

export interface FirebaseUserCredentials {
    email: string,
    password: string | null
}

export interface FirebaseUserRegisterInfo {
    uid: string,
    username: string,
    email: string,
    password: string | null
}

export interface FirebaseAuthUser {
    uid: string,
    role: Role,
    nickname: string,
    avatar?: any,
    name?: string,
    surname?: string,
    age?: string
}