import { Backend, Firebase } from "src/environments/environment"
import { StrapiAuthUser } from "../strapi-interfaces/strapi-user.interface";
import { FirebaseAuthUser } from "../firebase-interfaces/firebase-user.interface";

export interface JwtAuth {
    jwt: string
}

export type AuthUserOptions = FirebaseAuthUser | StrapiAuthUser;
export type AuthUser = Backend extends Firebase ? FirebaseAuthUser : StrapiAuthUser;
