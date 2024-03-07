import { Role } from "../../utilities/utilities"

export interface JwtAuth {
    jwt: string
}

export interface AuthUser {
    user_id: string | number
    role: Role
};
