import { Role } from "../globetrotting/user.interface";

export interface FirebaseAuthUser {
    uid: string,
    role: Role
}