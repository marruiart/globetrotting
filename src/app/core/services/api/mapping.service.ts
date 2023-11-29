import { Injectable } from '@angular/core';
import { Destination, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { NewUser, PaginatedUser, User } from '../../models/globetrotting/user.interface';
import { Media } from '../../models/globetrotting/media.interface';
import { Fav, NewFav } from '../../models/globetrotting/fav.interface';
import { Booking, NewBooking, PaginatedBooking } from '../../models/globetrotting/booking.interface';
import { Client, ClientFavDestination, PaginatedClient } from '../../models/globetrotting/client.interface';
import { Agent, PaginatedAgent } from '../../models/globetrotting/agent.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class MappingService {

  // Map to app

  public abstract mapDestination(res: any): Destination
  public abstract mapPaginatedDestinations(res: any): PaginatedDestination

  public abstract mapUser(res: any): User
  public abstract mapUsers(res: any): User[]
  public abstract mapPaginatedUsers(res: any): PaginatedUser

  public abstract mapFav(res: any): Fav
  public abstract mapFavs(res: any): Fav[]
  public abstract mapClientFavs(favs: Fav[]): ClientFavDestination[]

  public abstract mapClient(res: any): Client
  public abstract mapPaginatedClients(res: any): PaginatedClient

  public abstract mapAgent(res: any): Agent
  public abstract mapPaginatedAgents(res: any): PaginatedAgent

  public abstract mapBooking(res: any): Booking
  public abstract mapBookings(res: any): Booking[]
  public abstract mapPaginatedBookings(res: any): PaginatedBooking

  protected abstract mapImage(res: any): Media | undefined;

  // Map to API

  public abstract mapDestinationPayload(destination: NewDestination): any;
  public abstract mapFavPayload(fav: NewFav): any;
  public abstract mapExtendedUserPayload(user: NewUser): any;
  public abstract mapBookingPayload(destination: NewBooking): any;

}
