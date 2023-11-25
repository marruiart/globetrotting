export interface StrapiBooking {
    start: string,
    end: string,
    rating: number | null,
    isActive: boolean,
    isConfirmed: boolean,
    travelers: number
}