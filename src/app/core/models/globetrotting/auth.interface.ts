import { Backend, Firebase } from "src/environments/environment"
import { Role } from "./user.interface";

export interface JwtAuth {
    jwt: string
}

export interface AuthUser {
    user_id: string | number
    role: Role
};
