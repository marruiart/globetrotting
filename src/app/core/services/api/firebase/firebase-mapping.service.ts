import { TravelAgent, NewTravelAgent, AgentsTableRow } from "src/app/core/models/globetrotting/agent.interface";
import { Booking, PaginatedBooking, NewBooking, BookingsTableRow, ClientRowInfo, AgentRowInfo, AdminBookingsTableRow, AgentBookingsTableRow, ClientBookingsTableRow } from "src/app/core/models/globetrotting/booking.interface";
import { Client, PaginatedClient, NewClient } from "src/app/core/models/globetrotting/client.interface";
import { Destination, PaginatedDestination, NewDestination, DestinationsTableRow } from "src/app/core/models/globetrotting/destination.interface";
import { ClientFavDestination, Fav, NewFav } from "src/app/core/models/globetrotting/fav.interface";
import { Media } from "src/app/core/models/globetrotting/media.interface";
import { PaginatedUser, UserCredentialsOptions, NewExtUser, AdminAgentOrClientUser, AgentUser, ClientUser, User } from "src/app/core/models/globetrotting/user.interface";
import { MappingService } from "../mapping.service";
import { StrapiArrayResponse, StrapiData } from "src/app/core/models/strapi-interfaces/strapi-data.interface";
import { PaginatedData } from "src/app/core/models/globetrotting/pagination-data.interface";
import { DocumentData, DocumentSnapshot, Timestamp } from "firebase/firestore";
import { FirebaseCollectionResponse, FirebaseDocument } from "src/app/core/models/firebase-interfaces/firebase-data.interface";
import { Role, Roles } from "src/app/core/utilities/utilities";

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
        const pageCount = (res.size && res.pageSize) ? (res.size / res.pageSize) : 1;
        const isLastPage = res.docs.length !== res.pageSize || pageCount === 1;
        return {
            next: isLastPage ? null : res.docs[res.docs.length - 1] as DocumentSnapshot<DocumentData>,
            pageSize: res.pageSize ?? res.docs.length,
            pageCount: pageCount,
            total: res.size ?? res.docs.length
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
    public override mapAdminAgentOrClientUser(user: FirebaseDocument): AdminAgentOrClientUser {
        const role = user.data['role'];
        let _user = {
            role: user.data['role'],
            user_id: user.id,
            username: user.data['username'] ?? '',
            email: user.data['email'] ?? '',
            nickname: user.data['nickname'] ?? '',
            avatar: user.data['avatar'] ?? null,
            name: user.data['name'] ?? '',
            surname: user.data['surname'] ?? '',
            age: user.data['age'] ?? ''
        }
        if (role === Roles.ADMIN || role === Roles.AGENT) {
            return {
                ..._user,
                bookings: user.data['bookings'] ?? []
            } as AgentUser
        } else {
            return {
                ..._user,
                bookings: user.data['bookings'] ?? [],
                favorites: user.data['favorites'] ?? []
            } as ClientUser
        }
    }

    // DESTINATIONS

    public override mapDestination = (res: FirebaseDocument): Destination => {
        return {
            id: res.id,
            name: res.data['name'] ?? '',
            type: res.data['type'] ?? '',
            dimension: res.data['dimension'] ?? '',
            image: res.data['image'] ?? null,
            price: res.data['price'] ?? 0,
            description: res.data['description'] ?? '',
            fav: false
        }
    };

    public mapPaginatedDestinations = (res: FirebaseCollectionResponse): PaginatedDestination =>
        this.extractPaginatedData<Destination>(res);


    public mapDestinationTableRow(destination: Destination): DestinationsTableRow {
        return {
            id: destination.id,
            name: destination.name,
            type: destination.type,
            dimension: destination.dimension === 'unknown' ? '' : destination.dimension,
            price: destination.price,
            description: destination.description
        }
    }

    // USERS

    public override mapUser(res: FirebaseDocument): User {
        return {
            role: res.data['role'] as Role,
            user_id: res.id,
            ext_id: res.id,
            specific_id: res.id,
            username: res.data['username'],
            email: res.data['email'],
            nickname: res.data['nickname'],
            avatar: res.data['avatar'],
            name: res.data['name'],
            surname: res.data['surname'],
            age: res.data['age']
        } as User;
    }
    public override mapUsers(res: any): User[] {
        throw new Error("Method not implemented.");
    }
    public override mapPaginatedUsers(res: any): PaginatedUser {
        throw new Error("Method not implemented.");
    }
    public override mapUserCredentials(res: any): UserCredentialsOptions {
        throw new Error("Method not implemented.");
    }

    // FAVORITES

    public override mapFav = (res: ClientFavDestination): any => res

    public override mapFavs(res: FirebaseCollectionResponse): Fav[] {
        let favs = res.docs[0].data['destinations'] as any[];
        return favs.map(fav => {
            return { id: fav }
        })
    }

    public override mapClientFavs = (favs: ClientFavDestination[]): ClientFavDestination[] => favs;

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

    public override mapAgent = (res: FirebaseDocument): TravelAgent => ({
        id: res.id,
        user_id: res.id,
        bookings: []
    })

    public override mapPaginatedAgents = (res: FirebaseCollectionResponse): PaginatedData<AgentUser> => ({
        data: res.docs.map(agent => this.mapAdminAgentOrClientUser(agent) as AgentUser),
        pagination: this.mapPagination(res)
    })

    public override mapAgentTableRow = (agent: AgentUser): AgentsTableRow => ({
        ext_id: agent.ext_id,
        user_id: agent.user_id,
        username: agent.username,
        nickname: agent.nickname,
        name: agent.name,
        surname: agent.surname,
        email: agent.email
    })

    // BOOKING

    public timestampToYearMonthDay(timestamp: Timestamp): string {
        const milliseconds = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6);
        const date = new Date(milliseconds);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    public override mapBooking(res: FirebaseDocument): Booking {
        // TODO Cannot read properties of undefined (reading 'timestampToYearMonthDay')at mapBooking (firebase-mapping.service.ts:187:28)
        const start = this.timestampToYearMonthDay(res.data['start']);
        const end = this.timestampToYearMonthDay(res.data['end']);
        return {
            id: res.id,
            start: start,
            end: end,
            travelers: res.data['travelers'],
            rating: res.data['rating'],
            isActive: res.data['isActive'],
            isConfirmed: res.data['isConfirmed'],
            agent_id: res.data['agent_id'],
            agentName: res.data['agentName'],
            client_id: res.data['client_id'],
            clientName: res.data['clientName'],
            destination_id: res.data['destination_id'],
            destinationName: res.data['destinationName']
        }
    }
    public override mapBookings(res: any): Booking[] {
        throw new Error("Method not implemented.");
    }
    public override mapPaginatedBookings(res: any): PaginatedBooking {
        throw new Error("Method not implemented.");
    }

    public override mapBookingTableRow(role: Role, booking: Booking, client?: ClientRowInfo, agent?: AgentRowInfo): BookingsTableRow {
        let tableRow = {
            booking_id: booking.id,
            destination_id: booking.destination_id,
            destinationName: booking.destinationName ?? 'Unknown',
            start: booking.start,
            end: booking.end,
            travelers: booking.travelers,
            isConfirmed: booking.isConfirmed ?? false
        }
        if (role === 'ADMIN' && client !== undefined && agent !== undefined) {
            return { ...tableRow, ...agent, ...client } as AdminBookingsTableRow;
        } else if (role === 'AGENT' && client !== undefined) {
            return { ...tableRow, ...client } as AgentBookingsTableRow;
        } else if (role === 'AUTHENTICATED' && agent !== undefined) {
            return { ...tableRow, ...agent } as ClientBookingsTableRow;
        } else {
            throw Error('Error: Required bookings table information was not provided.')
        }
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
    public override mapExtUserPayload(user: any) {
        throw new Error("Method not implemented.");
    }
    public override mapUserCredentialsPayload(user: any) {
        throw new Error("Method not implemented.");
    }
    public override mapClientPayload(client: NewClient) {
        throw new Error("Method not implemented.");
    }
    public override mapAgentPayload(client: NewTravelAgent) {
        throw new Error("Method not implemented.");
    }
    public override mapBookingPayload = (booking: NewBooking) => booking;
}
