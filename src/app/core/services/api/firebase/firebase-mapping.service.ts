import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { FirebaseCollectionResponse, FirebaseDocument, FirebaseUserCredential } from "src/app/core/models/firebase-interfaces/firebase-data.interface";
import { FirebaseUserPayload } from "src/app/core/models/firebase-interfaces/firebase-user.interface";
import { AgentsTableRow, NewTravelAgent, TravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { AdminBookingsTableRow, AgentBookingsTableRow, AgentRowInfo, Booking, BookingsTableRow, ClientBookingsTableRow, ClientRowInfo, NewBooking, PaginatedBooking } from "src/app/core/models/globetrotting/booking.interface";
import { Client, NewClient, PaginatedClient } from "src/app/core/models/globetrotting/client.interface";
import { Destination, DestinationsTableRow, NewDestination, PaginatedDestination } from "src/app/core/models/globetrotting/destination.interface";
import { ClientFavDestination, Fav, NewFav } from "src/app/core/models/globetrotting/fav.interface";
import { Media } from "src/app/core/models/globetrotting/media.interface";
import { PaginatedData } from "src/app/core/models/globetrotting/pagination-data.interface";
import { AdminAgentOrClientUser, AgentRegisterInfo, AgentUser, ClientUser, PaginatedUser, User, UserCredentialsOptions, UserRegisterInfo } from "src/app/core/models/globetrotting/user.interface";
import { Role, Roles, isoDateToTimestamp, timestampToYearMonthDay } from "src/app/core/utilities/utilities";
import { MappingService } from "../mapping.service";

export class FirebaseMappingService extends MappingService {

    private extractPaginatedData<T>(res: FirebaseCollectionResponse): PaginatedData<T> {
        return {
            data: res.docs.map(doc => doc.data as T),
            pagination: this.mapPagination(res)
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
            coordinate: res.data['coordinate'] ?? { lat: 0, lng: 0 },
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
        ext_id: agent.user_id,
        user_id: agent.user_id,
        username: agent.username,
        nickname: agent.nickname,
        name: agent.name,
        surname: agent.surname,
        email: agent.email
    })

    // BOOKING

    public override mapBooking(res: FirebaseDocument): Booking {
        const start = timestampToYearMonthDay(res.data['start']);
        const end = timestampToYearMonthDay(res.data['end']);
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
        if (role === Roles.ADMIN && client !== undefined && agent !== undefined) {
            return { ...tableRow, ...agent, ...client } as AdminBookingsTableRow;
        } else if (role === Roles.AGENT && client !== undefined) {
            return { ...tableRow, ...client } as AgentBookingsTableRow;
        } else if (role === Roles.AUTHENTICATED && agent !== undefined) {
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

    public override mapNewDestinationPayload(destination: NewDestination) {
        let _destination = {
            name: destination.name,
            type: destination.type,
            dimension: destination.dimension,
            coordinate: destination.coordinate,
            image: destination.image,
            price: destination.price,
            description: destination.description,
            createdAt: isoDateToTimestamp(`${new Date()}`)
        }
        return this.removeEmptyValues(_destination);
    }

    public override mapDestinationPayload(destination: Destination) {
        let _destination = {
            id: destination.id,
            name: destination.name,
            type: destination.type,
            dimension: destination.dimension,
            coordinate: destination.coordinate,
            image: destination.image,
            price: destination.price,
            description: destination.description,
            updatedAt: isoDateToTimestamp(`${new Date()}`)
        }
        return this.removeEmptyValues(_destination);
    }

    public override mapFavPayload(fav: NewFav): NewFav {
        return fav;
    }

    public override mapNewExtUserPayload(user: UserRegisterInfo & FirebaseUserCredential, isAgent: boolean) {
        const _agentInfo = (user as AgentRegisterInfo & FirebaseUserCredential) ?? undefined;
        const nickname = (user as AgentRegisterInfo & FirebaseUserCredential).nickname ?? user.username;
    
        const commonInfo = {
          user_id: user.user.user.uid,
          username: user.username,
          email: user.email,
          nickname: nickname,
          createdAt: isoDateToTimestamp(`${new Date()}`)
        };
        if (isAgent) {
          return {
            ...commonInfo,
            role: Roles.AGENT,
            name: _agentInfo.name,
            surname: _agentInfo.surname,
          } as AgentUser;
        } else {
          return {
            ...commonInfo,
            role: Roles.AUTHENTICATED,
            favorites: []
          } as ClientUser;
        }
    }

    public override mapExtUserPayload(user: AdminAgentOrClientUser) {
        let payload: FirebaseUserPayload = {
            user_id: user.user_id as string,
            role: user.role,
            username: user.username,
            email: user.email,
            nickname: user.nickname,
            name: user.name,
            surname: user.surname,
            avatar: user.avatar,
            age: user.age,
            updatedAt: isoDateToTimestamp(`${new Date()}`)
        }
        return this.removeEmptyValues(payload);
    }

    public override mapUserCredentialsPayload(credentials: any) {
        return this.removeEmptyValues(credentials);
    }
    public override mapClientPayload(client: NewClient) {
        throw new Error("Method not implemented.");
    }

    public override mapAgentPayload(client: NewTravelAgent) {
        throw new Error("Method not implemented.");
    }

    public override mapNewBookingPayload = (booking: NewBooking) => (
        {
            ...booking,
            start: isoDateToTimestamp(booking.start),
            end: isoDateToTimestamp(booking.end),
            createdAt: isoDateToTimestamp(`${new Date()}`)
        }
    );

    public override mapBookingPayload = (booking: Booking) => (
        {
            ...booking,
            start: isoDateToTimestamp(new Date(booking.start).toISOString()),
            end: isoDateToTimestamp(new Date(booking.end).toISOString()),
            updatedAt: isoDateToTimestamp(`${new Date()}`)
        }
    )
}
