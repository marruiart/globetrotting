import { MappingService } from '../mapping.service';
import { StrapiArrayResponse, StrapiData, StrapiPayload, StrapiResponse } from 'src/app/core/models/strapi-interfaces/strapi-data.interface';
import { StrapiDestination } from 'src/app/core/models/strapi-interfaces/strapi-destination.interface';
import { StrapiMedia } from 'src/app/core/models/strapi-interfaces/strapi-media.interface';
import { StrapiExtendedUser, StrapiUser, StrapiUserCredentials } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { Destination, NewDestination, PaginatedDestination } from 'src/app/core/models/globetrotting/destination.interface';
import { NewExtUser, PaginatedExtUser, ExtUser, Role } from 'src/app/core/models/globetrotting/user.interface';
import { Media } from 'src/app/core/models/globetrotting/media.interface';
import { StrapiFav } from 'src/app/core/models/strapi-interfaces/strapi-fav.interface';
import { Fav, NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { Client, ClientBooking, ClientFavDestination, NewClient, PaginatedClient } from 'src/app/core/models/globetrotting/client.interface';
import { Booking, NewBooking, PaginatedBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { StrapiBooking } from 'src/app/core/models/strapi-interfaces/strapi-booking.interface';
import { StrapiClient } from 'src/app/core/models/strapi-interfaces/strapi-client.interface';
import { PaginatedData } from 'src/app/core/models/globetrotting/pagination-data.interface';
import { StrapiAgent } from 'src/app/core/models/strapi-interfaces/strapi-agent.interface';
import { TravelAgent, PaginatedAgent, NewTravelAgent } from 'src/app/core/models/globetrotting/agent.interface';
import { AuthUser } from 'src/app/core/models/globetrotting/auth.interface';
import { StrapiMeResponse } from 'src/app/core/models/strapi-interfaces/strapi-auth.interface';

export class StrapiMappingService extends MappingService {

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

  // AUTH & USER
  public mapAuthUser = (res: StrapiMeResponse): AuthUser => (
    {
      user_id: res.id,
      role: res.role.type.toUpperCase() as Role
    }
  );

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

  // USERS

  private mapUserData = (data: StrapiData<StrapiExtendedUser>): ExtUser => {
    const user_id = (data.attributes.user as StrapiResponse<StrapiUser>)?.data?.id ?? null;
    if (!user_id) {
      console.info(`Usuario con id ${data.id} no asociado a un user_id`);
    }
    return {
      id: data.id,
      avatar: data.attributes.avatar ? this.mapImage(data.attributes.avatar) : undefined,
      nickname: data.attributes.nickname,
      name: data.attributes.name,
      surname: data.attributes.surname,
      age: data.attributes.age,
      user_id: user_id,
    }
  }

  public mapExtUser = (res: StrapiResponse<StrapiExtendedUser>): ExtUser =>
    this.mapUserData(res.data);

  public mapExtUsers = (res: StrapiArrayResponse<StrapiExtendedUser>): ExtUser[] =>
    this.extractArrayData<ExtUser, StrapiExtendedUser>(res, this.mapUserData);

  public mapPaginatedUsers = (res: StrapiArrayResponse<StrapiExtendedUser>): PaginatedExtUser =>
    this.extractPaginatedData<ExtUser, StrapiExtendedUser>(res, this.mapUserData);

  public mapUserCredentials = (res: StrapiUser): StrapiUserCredentials => {
    const credentials: StrapiUserCredentials = {
      id: res.id,
      username: res.username,
      email: res.email,
      password: null
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
      user_id: (data.attributes.user as StrapiResponse<StrapiUser>)?.data?.id,
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
      user_id: (data.attributes.user as StrapiResponse<StrapiUser>).data.id,
      type: 'AGENT',
      bookings: this.mapBookings(data.attributes.bookings)
    }
  }

  public mapAgent = (res: StrapiResponse<StrapiAgent>): TravelAgent =>
    this.mapAgentData(res.data);

  public mapPaginatedAgents = (res: StrapiArrayResponse<StrapiAgent>): PaginatedAgent =>
    this.extractPaginatedData<TravelAgent, StrapiAgent>(res, this.mapAgentData);

  // BOOKING

  private mapBookingData = (data: StrapiData<StrapiBooking>): Booking => {
    return {
      id: data.id,
      start: data.attributes.start,
      end: data.attributes.end,
      rating: data.attributes.rating,
      isActive: data.attributes.isActive,
      isConfirmed: data.attributes.isConfirmed,
      travelers: data.attributes.travelers,
      client_id: (data.attributes.client as StrapiResponse<StrapiClient>)?.data?.id,
      destination_id: (data.attributes.destination as StrapiResponse<StrapiDestination>)?.data?.id,
      agent_id: (data.attributes.agent as StrapiResponse<StrapiAgent>)?.data?.id
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

  public mapExtendedUserPayload(user: NewExtUser): StrapiPayload<StrapiExtendedUser> {
    return {
      data: {
        nickname: user.nickname,
        name: user.name,
        surname: user.surname,
        age: user.age,
        user: user.user_id,
        avatar: null,
      }
    }
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
        start: booking.start,
        end: booking.start,
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
