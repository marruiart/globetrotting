import { TravelAgent, PaginatedAgent, NewTravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { AuthUser } from "src/app/core/models/globetrotting/auth.interface";
import { Booking, PaginatedBooking, NewBooking } from "src/app/core/models/globetrotting/booking.interface";
import { ClientFavDestination, Client, PaginatedClient, NewClient } from "src/app/core/models/globetrotting/client.interface";
import { Destination, PaginatedDestination, NewDestination } from "src/app/core/models/globetrotting/destination.interface";
import { Fav, NewFav } from "src/app/core/models/globetrotting/fav.interface";
import { Media } from "src/app/core/models/globetrotting/media.interface";
import { ExtUser, PaginatedExtUser, UserCredentialsOptions, NewExtUser } from "src/app/core/models/globetrotting/user.interface";
import { MappingService } from "../mapping.service";
import { StrapiArrayResponse, StrapiData } from "src/app/core/models/strapi-interfaces/strapi-data.interface";
import { PaginatedData } from "src/app/core/models/globetrotting/pagination-data.interface";
import { DocumentData, DocumentSnapshot, QuerySnapshot } from "firebase/firestore";

export class FirebaseMappingService extends MappingService {

    private extractPaginatedData<T>(res: any[]): PaginatedData<T> {
        return {
            data: res.map<T>(doc => {
                const docData = doc.data();
                return  { ...docData, ...{ id: doc.id } } as T
            }),
            pagination: this.mapPagination(res)
        }
    }

    private extractArrayData<T, S>(res: StrapiArrayResponse<S> | undefined, callback: (data: StrapiData<S>) => T): T[] {
        if (res?.data) {
            return Array.from(res?.data)
                .reduce((prev: T[], data: StrapiData<S>): T[] => {
                    let _mappedData: T = callback(data);
                    prev.push(_mappedData);
                    return prev;
                }, []);
        } else {
            return [];
        }
    }

    private mapPagination(res: any[]) {
        return {
            next: res.length > 0 ? res[res.length - 1] as DocumentSnapshot<DocumentData> : null,
            pageSize: res.length,
            total: 3
        }
    }

    // AUTH & USER
    public override mapAuthUser(res: any): AuthUser {
        throw new Error("Method not implemented.");
    }

    // DESTINATIONS

    public override mapDestination(res: any): Destination {
        throw new Error("Method not implemented.");
    }

    public mapPaginatedDestinations = (res: any): PaginatedDestination =>
        this.extractPaginatedData<Destination>(res);

    // USERS

    public override mapExtUser(res: any): ExtUser {
        throw new Error("Method not implemented.");
    }
    public override mapExtUsers(res: any): ExtUser[] {
        throw new Error("Method not implemented.");
    }
    public override mapPaginatedUsers(res: any): PaginatedExtUser {
        throw new Error("Method not implemented.");
    }
    public override mapUserCredentials(res: any): UserCredentialsOptions {
        throw new Error("Method not implemented.");
    }

    // FAVORITES

    public override mapFav(res: any): Fav {
        throw new Error("Method not implemented.");
    }
    public override mapFavs(res: any): Fav[] {
        throw new Error("Method not implemented.");
    }
    public override mapClientFavs(favs: Fav[]): ClientFavDestination[] {
        throw new Error("Method not implemented.");
    }

    // AUTHENTICATED

    public override mapClient(res: any): Client {
        throw new Error("Method not implemented.");
    }
    public override mapClients(res: any): Client[] {
        throw new Error("Method not implemented.");
    }
    public override mapPaginatedClients(res: any): PaginatedClient {
        throw new Error("Method not implemented.");
    }

    // AGENT

    public override mapAgent(res: any): TravelAgent {
        throw new Error("Method not implemented.");
    }
    public override mapPaginatedAgents(res: any): PaginatedAgent {
        throw new Error("Method not implemented.");
    }

    // BOOKING

    public override mapBooking(res: any): Booking {
        throw new Error("Method not implemented.");
    }
    public override mapBookings(res: any): Booking[] {
        throw new Error("Method not implemented.");
    }
    public override mapPaginatedBookings(res: any): PaginatedBooking {
        throw new Error("Method not implemented.");
    }

    // MEDIA

    protected override mapImage(res: any): Media | undefined {
        throw new Error("Method not implemented.");
    }

    // Map to API

    public override mapDestinationPayload(destination: NewDestination) {
        throw new Error("Method not implemented.");
    }
    public override mapFavPayload(fav: NewFav) {
        throw new Error("Method not implemented.");
    }
    public override mapExtendedUserPayload(user: NewExtUser) {
        throw new Error("Method not implemented.");
    }
    public override mapClientPayload(client: NewClient) {
        throw new Error("Method not implemented.");
    }
    public override mapAgentPayload(client: NewTravelAgent) {
        throw new Error("Method not implemented.");
    }
    public override mapBookingPayload(destination: NewBooking) {
        throw new Error("Method not implemented.");
    }
}
