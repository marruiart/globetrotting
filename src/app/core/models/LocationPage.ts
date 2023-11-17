import { Location } from "./Location"

export interface LocationPage {
    info: {
        count:number,
        pages: number,
        next: string | null,
        prev: string | null
    },
    results: Location[]
}