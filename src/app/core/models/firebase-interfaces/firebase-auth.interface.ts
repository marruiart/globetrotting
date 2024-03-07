import { Role } from "../../utilities/utilities";

export interface FirebaseAuthUser {
    uid: string,
    role: Role
}