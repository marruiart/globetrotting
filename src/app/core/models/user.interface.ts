export interface NewUser {
    nickname: string,
    avatar?: Avatar,
    name?: string,
    surname?: string,
    age?: string,
    user_id: number
}

interface Avatar {
    data: {
        id: number,
        attributes: {
            name: string,
            alternativeText: string | null,
            caption: string | null,
            width: number,
            height: number,
            formats: {}
        }
    }
}

export interface User extends NewUser {
    id: number
}