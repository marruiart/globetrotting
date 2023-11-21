import { User } from "./user.interface"

export interface Auth {
    jwt: string
}

export interface AuthUser {
    user_id: number,
    role: string
}