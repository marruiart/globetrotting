import { MappingService } from '../mapping.service';
import { StrapiArrayResponse, StrapiData, StrapiPayload, StrapiResponse } from 'src/app/core/models/strapi-interfaces/strapi-data.interface';
import { StrapiDestination } from 'src/app/core/models/strapi-interfaces/strapi-destination.interface';
import { StrapiMedia } from 'src/app/core/models/strapi-interfaces/strapi-media.interface';
import { StrapiExtendedUser } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { Destination, NewDestination, PaginatedDestination } from 'src/app/core/models/globetrotting/destination.interface';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { Media } from 'src/app/core/models/globetrotting/media.interface';
import { StrapiFav } from 'src/app/core/models/strapi-interfaces/strapi-fav.interface';
import { Fav } from 'src/app/core/models/globetrotting/fav.interface';
import { Client, PaginatedClient } from 'src/app/core/models/globetrotting/client.interface';
import { Booking, PaginatedBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { StrapiBooking } from 'src/app/core/models/strapi-interfaces/strapi-booking.interface';
import { StrapiClient } from 'src/app/core/models/strapi-interfaces/strapi-client.interface';
import { PaginatedData } from 'src/app/core/models/globetrotting/pagination-data.interface';
import { StrapiAgent } from 'src/app/core/models/strapi-interfaces/strapi-agent.interface';
import { Agent, PaginatedAgent } from 'src/app/core/models/globetrotting/agent.interface';

export class MappingStrapiService extends MappingService {

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

  private extractArrayData<T, S>(res: StrapiArrayResponse<S>, callback: (data: StrapiData<S>) => T): T[] {
    return Array.from(res.data)
      .reduce((prev: T[], data: StrapiData<S>): T[] => {
        let _mappedData: T = callback(data);
        prev.push(_mappedData);
        return prev;
      }, []);
  }

  private mapPagination(res: StrapiArrayResponse<any>) {
    return {
      page: res.meta.pagination.page,
      pageSize: res.meta.pagination.pageSize,
      pageCount: res.meta.pagination.pageCount,
      total: res.meta.pagination.total
    }
  }

  // DESTINATIONS

  private mapDestinationData(data: StrapiData<StrapiDestination>): Destination {
    return {
      id: data.id,
      name: data.attributes.name,
      type: data.attributes.type,
      dimension: data.attributes.dimension,
      price: data.attributes.price,
      image: data.attributes.image ? this.mapImage(data.attributes.image) : undefined,
      description: data.attributes.description
    }
  }

  public mapDestination = (res: StrapiResponse<StrapiDestination>): Destination =>
    this.mapDestinationData(res.data);

  public mapPaginatedDestinations = (res: StrapiArrayResponse<StrapiDestination>): PaginatedDestination =>
    this.extractPaginatedData<Destination, StrapiDestination>(res, this.mapDestinationData);

  // USERS

  private mapUserData = (data: StrapiData<StrapiExtendedUser>): User => {
    return {
      id: data.id,
      avatar: data.attributes.avatar ? this.mapImage(data.attributes.avatar) : undefined,
      nickname: data.attributes.nickname,
      name: data.attributes.name,
      surname: data.attributes.surname,
      age: data.attributes.age,
      user_id: data.attributes.user_id,
    }
  }

  public mapUser = (res: StrapiResponse<StrapiExtendedUser>): User =>
    this.mapUserData(res.data);

  public mapUsers = (res: StrapiArrayResponse<StrapiExtendedUser>): User[] =>
    this.extractArrayData<User, StrapiExtendedUser>(res, this.mapUserData);

  // FAVORITES

  private mapFavData = (data: StrapiData<StrapiFav>): Fav => {
    return {
      id: data.id,
      destination_id: data.attributes.destination.id,
      client_id: data.attributes.client.id
    }
  }

  public mapFav = (res: StrapiResponse<StrapiFav>): Fav =>
    this.mapFavData(res.data);

  public mapFavs = (res: StrapiArrayResponse<StrapiFav>): Fav[] =>
    this.extractArrayData<Fav, StrapiFav>(res, this.mapFavData);

  // CLIENT

  private mapClientData = (data: StrapiData<StrapiClient>): Client => {
    return {
      id: data.id,
      bookings: this.mapBookings(data.attributes.bookings),
      favorites: this.mapFavs(data.attributes.favorites).map(fav => { return { id: fav.destination_id } })
    }
  }

  public mapClient = (res: StrapiResponse<StrapiClient>): Client =>
    this.mapClientData(res.data);

  public mapPaginatedClients = (res: StrapiArrayResponse<StrapiClient>): PaginatedClient =>
    this.extractPaginatedData<Client, StrapiClient>(res, this.mapClientData);

  // AGENT

  private mapAgentData = (data: StrapiData<StrapiAgent>): Agent => {
    return {
      id: data.id,
      bookings: this.mapBookings(data.attributes.bookings)
    }
  }

  public mapAgent = (res: StrapiResponse<StrapiAgent>): Agent =>
    this.mapAgentData(res.data);

  public mapPaginatedAgents = (res: StrapiArrayResponse<StrapiAgent>): PaginatedAgent =>
    this.extractPaginatedData<Agent, StrapiAgent>(res, this.mapAgentData);

  // BOOKING

  private mapBookingData = (data: StrapiData<StrapiBooking>): Booking => {
    return {
      id: data.id,
      start: data.attributes.start,
      end: data.attributes.end,
      rating: data.attributes.rating,
      isActive: data.attributes.isActive,
      isConfirmed: data.attributes.isConfirmed,
      travelers: data.attributes.travelers
    }
  }

  public mapBooking = (res: StrapiResponse<StrapiBooking>): Booking =>
    this.mapBookingData(res.data);

  public mapPaginatedBookings = (res: StrapiArrayResponse<StrapiBooking>): PaginatedBooking =>
    this.extractPaginatedData<Booking, StrapiBooking>(res, this.mapBookingData);

  public mapBookings = (res: StrapiArrayResponse<StrapiBooking>): Booking[] =>
    this.extractArrayData<Booking, StrapiBooking>(res, this.mapBookingData);

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

}
