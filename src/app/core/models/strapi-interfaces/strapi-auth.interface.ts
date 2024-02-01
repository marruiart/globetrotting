import { Role } from "../globetrotting/user.interface";

export interface StrapiMeResponse {
    id: number
    username: string,
    email: string
    role: {
        type: string
    }
}