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
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { FirebaseCollectionResponse } from "src/app/core/models/firebase-interfaces/firebase-data.interface";

export class FirebaseMappingService extends MappingService {

    private extractPaginatedData<T>(res: FirebaseCollectionResponse): PaginatedData<T> {
        return {
            data: res.docs.map(doc => doc.data as T),
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

    private mapPagination(res: FirebaseCollectionResponse) {
        return {
            next: res.docs.length == res.pageSize ? res.docs[res.docs.length - 1] as DocumentSnapshot<DocumentData> : null,
            pageSize: res.pageSize,
            pageCount: res.size && res.pageSize ? res.size / res.pageSize : undefined,
            total: res.size
        }
    }

    private removeEmptyValues(data: { [key: string]: any }): { [key: string]: any } {
        let dataPayload: any = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                dataPayload[key] = value;
            }
        })
        return dataPayload;
    }

    // AUTH & USER
    public override mapAuthUser(user: AuthUser): AuthUser {
        return this.removeEmptyValues(user) as AuthUser;
    }

    // DESTINATIONS

    public override mapDestination(res: Destination): Destination {
        return res;
    }

    public mapPaginatedDestinations = (res: FirebaseCollectionResponse): PaginatedDestination =>
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

    public override mapFav = (res: any): Fav => res;

    public override mapFavs(res: FirebaseCollectionResponse): Fav[] {
        let favs = res.docs[0].data['destinations'] as [];
        return favs.map(fav => {
            return { id: fav }
        })
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

    public override mapDestinationPayload(destination: NewDestination): NewDestination {
        return this.removeEmptyValues(destination) as NewDestination;
    }
    public override mapFavPayload(fav: NewFav): NewFav {
        return fav;
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
