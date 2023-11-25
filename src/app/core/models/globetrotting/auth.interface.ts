import { User } from "./user.interface"

export interface Auth {
    jwt: string
}

export interface AuthUser {
    user_id: number,
    role: string
}

export interface ExtendedAuthUser extends AuthUser {
    extended_id: number | null,
    client_id: number | null,
    agent_id: number | null
}