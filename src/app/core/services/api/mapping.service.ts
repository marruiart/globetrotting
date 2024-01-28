import { Injectable } from '@angular/core';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { NewExtUser, PaginatedExtUser, ExtUser, UserCredentials, UserCredentialsOptions } from '../../models/globetrotting/user.interface';
import { Media } from '../../models/globetrotting/media.interface';
import { Fav, NewFav } from '../../models/globetrotting/fav.interface';
import { Booking, NewBooking, PaginatedBooking } from '../../models/globetrotting/booking.interface';
import { Client, ClientFavDestination, NewClient, PaginatedClient } from '../../models/globetrotting/client.interface';
import { TravelAgent, PaginatedAgent, NewTravelAgent } from '../../models/globetrotting/agent.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class MappingService {

  // Map to app

  public abstract mapDestination(res: any): Destination
  public abstract mapPaginatedDestinations(res: any): PaginatedDestination

  public abstract mapUser(res: any): ExtUser
  public abstract mapUsers(res: any): ExtUser[]
  public abstract mapPaginatedUsers(res: any): PaginatedExtUser
  public abstract mapUserCredentials(res: any): UserCredentialsOptions

  public abstract mapFav(res: any): Fav
  public abstract mapFavs(res: any): Fav[]
  public abstract mapClientFavs(favs: Fav[]): ClientFavDestination[]

  public abstract mapClient(res: any): Client
  public abstract mapClients(res: any): Client[]
  public abstract mapPaginatedClients(res: any): PaginatedClient

  public abstract mapAgent(res: any): TravelAgent
  public abstract mapPaginatedAgents(res: any): PaginatedAgent

  public abstract mapBooking(res: any): Booking
  public abstract mapBookings(res: any): Booking[]
  public abstract mapPaginatedBookings(res: any): PaginatedBooking

  protected abstract mapImage(res: any): Media | undefined;

  // Map to API

  public abstract mapDestinationPayload(destination: NewDestination): any;
  public abstract mapFavPayload(fav: NewFav): any;
  public abstract mapExtendedUserPayload(user: NewExtUser): any;
  public abstract mapClientPayload(client: NewClient): any
  public abstract mapAgentPayload(client: NewTravelAgent): any
  public abstract mapBookingPayload(destination: NewBooking): any;

}
