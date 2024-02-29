import { MappingService } from '../mapping.service';
import { StrapiArrayResponse, StrapiData, StrapiPayload, StrapiResponse } from 'src/app/core/models/strapi-interfaces/strapi-data.interface';
import { StrapiDestination } from 'src/app/core/models/strapi-interfaces/strapi-destination.interface';
import { StrapiMedia } from 'src/app/core/models/strapi-interfaces/strapi-media.interface';
import { StrapiUserRoleResponse, StrapiExtendedUser, StrapiUser, StrapiUserCredentials, NewStrapiExtUserPayload } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { Destination, DestinationsTableRow, NewDestination, PaginatedDestination } from 'src/app/core/models/globetrotting/destination.interface';
import { PaginatedUser, AdminAgentOrClientUser, AgentUser, ClientUser, User } from 'src/app/core/models/globetrotting/user.interface';
import { Media } from 'src/app/core/models/globetrotting/media.interface';
import { StrapiFav } from 'src/app/core/models/strapi-interfaces/strapi-fav.interface';
import { ClientFavDestination, Fav, NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { Client, NewClient, PaginatedClient } from 'src/app/core/models/globetrotting/client.interface';
import { AdminBookingsTableRow, AgentRowInfo, AgentBookingsTableRow, Booking, BookingsTableRow, ClientRowInfo, ClientBookingsTableRow, NewBooking, PaginatedBooking, ClientBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { StrapiBooking } from 'src/app/core/models/strapi-interfaces/strapi-booking.interface';
import { StrapiClient } from 'src/app/core/models/strapi-interfaces/strapi-client.interface';
import { PaginatedData } from 'src/app/core/models/globetrotting/pagination-data.interface';
import { StrapiAgent } from 'src/app/core/models/strapi-interfaces/strapi-agent.interface';
import { TravelAgent, PaginatedAgent, NewTravelAgent, AgentsTableRow } from 'src/app/core/models/globetrotting/agent.interface';
import { Role, Roles, isType } from 'src/app/core/utilities/utilities';
import { DatePipe } from '@angular/common';
import { inject } from '@angular/core';

export class StrapiMappingService extends MappingService {
  private datePipe: DatePipe = inject(DatePipe);

  private extractPaginatedData<T, S>(res: StrapiArrayResponse<S>, callback: (data: StrapiData<S>) => T): PaginatedData<T> {
    return {
      data: JSON.parse(JSON.stringify(res.data))
        .reduce((prev: T[], data: StrapiData<S>): T[] => {
          let _mappedData = callback(data);
          prev.push(_mappedData);
          return prev;
        }, []),
      pagination: this.mapPagination(res)
    }
  }

  /**
   * Receives a generic strapi array response and a callback and returns an array of objects mapped for this application use.
   */
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

  private mapPagination(res: StrapiArrayResponse<any>) {
    const page = res.meta.pagination.page;
    const pageCount = res.meta.pagination.pageCount;
    return {
      prev: page == 1 ? null : page - 1,
      page: page,
      next: page == pageCount ? null : page + 1,
      pageSize: res.meta.pagination.pageSize,
      pageCount: pageCount,
      total: res.meta.pagination.total
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
  public mapAdminAgentOrClientUser(user: User & (StrapiAgent | StrapiClient)): AdminAgentOrClientUser {
    let _user = {
      role: user.role,
      user_id: user.user_id,
      ext_id: user.ext_id,
      specific_id: user.specific_id,
      username: user.username ?? '',
      email: user.email ?? '',
      nickname: user.nickname,
      avatar: user.avatar ?? null,
      name: user.name ?? '',
      surname: user.surname ?? '',
      age: user.age ?? ''
    }
    if (user.role === Roles.AGENT || user.role === Roles.ADMIN) {
      return {
        ..._user,
        bookings: user.bookings ?? []
      } as AgentUser
    } else {
      return {
        ..._user,
        bookings: user.bookings ?? [],
        favorites: (user as StrapiClient).favorites ?? []
      } as ClientUser
    }
  }


  // DESTINATIONS

  private mapDestinationData = (data: StrapiData<StrapiDestination>): Destination => (
    {
      id: data.id,
      name: data.attributes.name,
      type: data.attributes.type,
      dimension: data.attributes.dimension,
      price: data.attributes.price,
      image: data.attributes.image?.data ? this.mapImage(data.attributes.image) : undefined,
      description: data.attributes.description
    }
  )

  public mapDestination = (res: StrapiResponse<StrapiDestination>): Destination =>
    this.mapDestinationData(res.data);

  public mapPaginatedDestinations = (res: StrapiArrayResponse<StrapiDestination>): PaginatedDestination =>
    this.extractPaginatedData<Destination, StrapiDestination>(res, this.mapDestinationData);

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

  private mapUserData = (data: StrapiData<StrapiExtendedUser>): User => {
    const user = data.attributes.user as StrapiResponse<StrapiUserRoleResponse>;
    const role = user?.data.attributes.role?.data.attributes.type ?? null;
    const user_id = user?.data?.id ?? null;
    if (!user_id) {
      console.info(`User with ext_id ${data.id} not related to any user_id`);
    }
    return {
      role: role?.toUpperCase() as Role ?? undefined,
      user_id: user_id,
      ext_id: data.id,
      username: user.data.attributes.username,
      email: user.data.attributes.email,
      nickname: data.attributes.nickname,
      avatar: data.attributes.avatar ? this.mapImage(data.attributes.avatar) : undefined,
      name: data.attributes.name,
      surname: data.attributes.surname,
      age: data.attributes.age
    }
  }

  public mapUser = (res: StrapiResponse<StrapiExtendedUser>): User =>
    this.mapUserData(res.data);

  public mapUsers = (res: StrapiArrayResponse<StrapiExtendedUser>): User[] =>
    this.extractArrayData<User, StrapiExtendedUser>(res, this.mapUserData);

  public mapPaginatedUsers = (res: StrapiArrayResponse<StrapiExtendedUser>): PaginatedUser =>
    this.extractPaginatedData<User, StrapiExtendedUser>(res, this.mapUserData);

  public mapUserCredentials = (res: StrapiUser): StrapiUserCredentials => {
    const credentials: StrapiUserCredentials = {
      id: res.id,
      username: res.username,
      email: res.email,
      password: null,
      role: res.role?.type ? res.role?.type.toUpperCase() as Role : undefined
    }
    return credentials;
  }

  // FAVORITES

  private mapFavData = (data: StrapiData<StrapiFav>): Fav => {
    const destination_id = (data.attributes.destination as StrapiResponse<StrapiDestination>)?.data?.id;
    const client_id = (data.attributes.client as StrapiResponse<StrapiClient>)?.data?.id;
    return {
      id: data.id,
      destination_id: destination_id,
      client_id: client_id
    }
  }

  public mapFav = (res: StrapiResponse<StrapiFav>): Fav =>
    this.mapFavData(res.data);

  public mapFavs = (res?: StrapiArrayResponse<StrapiFav>): Fav[] =>
    this.extractArrayData<Fav, StrapiFav>(res, this.mapFavData);

  public mapClientFavs = (favs: Fav[]): ClientFavDestination[] => favs.reduce((prev: ClientFavDestination[], fav: Fav): ClientFavDestination[] => {
    if (fav.destination_id) {
      prev.push({ fav_id: fav.id, destination_id: fav.destination_id });
    }
    return prev;
  }, [])

  // AUTHENTICATED

  private mapClientData = (data: StrapiData<StrapiClient>): Client => {
    return {
      id: data.id,
      user_id: (data.attributes.user as StrapiResponse<StrapiUserRoleResponse>)?.data?.id,
      type: 'AUTHENTICATED',
      bookings: this.mapClientBookings(this.mapBookings(data.attributes.bookings)),
      favorites: this.mapClientFavs(this.mapFavs(data.attributes.favorites))
    }
  }

  public mapClient = (res: StrapiResponse<StrapiClient>): Client =>
    this.mapClientData(res.data);

  public mapClients = (res?: StrapiArrayResponse<StrapiClient>): Client[] =>
    this.extractArrayData<Client, StrapiClient>(res, this.mapClientData);

  public mapPaginatedClients = (res: StrapiArrayResponse<StrapiClient>): PaginatedClient =>
    this.extractPaginatedData<Client, StrapiClient>(res, this.mapClientData);

  // AGENT

  private mapAgentData = (data: StrapiData<StrapiAgent>): TravelAgent => {
    return {
      id: data.id,
      user_id: (data.attributes.user as StrapiResponse<StrapiUserRoleResponse>).data.id,
      bookings: this.mapBookings(data.attributes.bookings)
    }
  }

  public mapAgent = (res: StrapiResponse<StrapiAgent>): TravelAgent =>
    this.mapAgentData(res.data);

  public mapPaginatedAgents = (res: StrapiArrayResponse<StrapiAgent>): PaginatedAgent =>
    this.extractPaginatedData<TravelAgent, StrapiAgent>(res, this.mapAgentData);

  public override mapAgentTableRow = (agent: AgentUser): AgentsTableRow => ({
    ext_id: agent.ext_id,
    user_id: agent.user_id,
    username: agent.username,
    nickname: agent.nickname,
    name: agent.name,
    surname: agent.surname,
    email: agent.email
  })

  public override mapBookingTableRow = (role: Role, booking: Booking, client?: ClientRowInfo, agent?: AgentRowInfo): BookingsTableRow => {
    let tableRow = {
      booking_id: booking.id,
      client_id: client?.client_id ?? role,
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

  // BOOKING

  private mapBookingData = (data: StrapiData<StrapiBooking>): Booking => {
    const destination = data.attributes.destination ? data.attributes.destination as StrapiResponse<StrapiDestination> : undefined;
    const client = data.attributes.client ? data.attributes.client as StrapiResponse<StrapiClient> : undefined;
    const agent = data.attributes.agent ? data.attributes.agent as StrapiResponse<StrapiAgent> : undefined;
    const destinationData = destination?.data ? this.mapDestination(destination) : undefined;
    const clientData = client?.data ? this.mapClient(client) : undefined;
    const agentData = agent?.data ? this.mapAgent(agent) : undefined;

    return {
      id: data.id,
      start: data.attributes.start,
      end: data.attributes.end,
      rating: data.attributes.rating,
      isActive: data.attributes.isActive,
      isConfirmed: data.attributes.isConfirmed,
      travelers: data.attributes.travelers,
      client_id: clientData?.user_id ?? 0,
      destination_id: destinationData?.id ?? 0,
      agent_id: agentData?.user_id,
      destinationName: destinationData?.name
    }
  }

  public mapBooking = (res: StrapiResponse<StrapiBooking>): Booking =>
    this.mapBookingData(res.data);

  public mapPaginatedBookings = (res: StrapiArrayResponse<StrapiBooking>): PaginatedBooking =>
    this.extractPaginatedData<Booking, StrapiBooking>(res, this.mapBookingData);

  public mapBookings = (res?: StrapiArrayResponse<StrapiBooking>): Booking[] =>
    this.extractArrayData<Booking, StrapiBooking>(res, this.mapBookingData);

  public mapClientBookings = (bookings: Booking[]): ClientBooking[] => bookings.reduce((prev: ClientBooking[], booking: Booking): ClientBooking[] => {
    if (booking.id) {
      prev.push({ booking_id: booking.id });
    }
    return prev;
  }, [])

  // MEDIA

  protected mapImage(res: StrapiResponse<StrapiMedia> | undefined): Media | undefined {
    if (res?.data) {
      return {
        id: res.data.id,
        url_small: res.data.attributes.formats.small.url,
        url_medium: res.data.attributes.formats.medium.url,
        url_large: res.data.attributes.formats.large.url,
        url_thumbnail: res.data.attributes.formats.thumbnail.url
      }
    } else {
      return undefined
    }
  }

  // Map to API

  public mapDestinationPayload(destination: NewDestination): StrapiPayload<StrapiDestination> {
    return {
      data: {
        name: destination.name,
        type: destination.type,
        dimension: destination.dimension,
        price: destination.price,
        image: undefined,
        description: destination.description
      }
    }
  }

  public mapFavPayload(fav: NewFav): StrapiPayload<StrapiFav> | null {
    if (fav.destination_id && fav.client_id) {
      return {
        data: {
          destination: fav.destination_id,
          client: fav.client_id
        }
      }
    } else {
      return null
    }
  }

  public mapNewExtUserPayload(user: User): StrapiPayload<any> {
    const extUser: NewStrapiExtUserPayload = {
      nickname: user.nickname,
      name: user.name,
      surname: user.surname,
      user: user.user_id as number
    };
    return { data: this.removeEmptyValues(extUser) };
  }

  public mapUserCredentialsPayload(user: User): any {
    const credentials: StrapiUserCredentials = {
      id: user.user_id as number,
      username: user.username,
      password: null,
      email: user.email
    };
    return this.removeEmptyValues(credentials);
  }

  public mapClientPayload(client: NewClient): StrapiPayload<StrapiClient> {
    return {
      data: {
        user: client.user_id
      }
    }
  }

  public mapAgentPayload(agent: NewTravelAgent): StrapiPayload<StrapiAgent> {
    return {
      data: {
        user: agent.user_id
      }
    }
  }

  public mapBookingPayload(booking: NewBooking): StrapiPayload<StrapiBooking> {
    return {
      data: {
        start: this.datePipe.transform(booking.start, 'yyyy-MM-dd'),
        end: this.datePipe.transform(booking.end, 'yyyy-MM-dd'),
        isActive: booking.isActive,
        isConfirmed: booking.isConfirmed,
        travelers: booking.travelers,
        client: booking.client_id,
        agent: booking.agent_id,
        destination: booking.destination_id
      }
    }
  }

}
