import { Injectable } from '@angular/core';
import { Destination, DestinationsTableRow, NewDestination, PaginatedDestination } from '../../models/globetrotting/destination.interface';
import { NewExtUser, PaginatedUser, UserCredentialsOptions, AdminAgentOrClientUser, User } from '../../models/globetrotting/user.interface';
import { Media } from '../../models/globetrotting/media.interface';
import { ClientFavDestination, Fav, NewFav } from '../../models/globetrotting/fav.interface';
import { AgentRowInfo, Booking, BookingsTableRow, ClientRowInfo, NewBooking, PaginatedBooking } from '../../models/globetrotting/booking.interface';
import { Client, NewClient, PaginatedClient } from '../../models/globetrotting/client.interface';
import { TravelAgent, NewTravelAgent, AgentsTableRow } from '../../models/globetrotting/agent.interface';
import { PaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { Role } from '../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export abstract class MappingService {

  // Map to app

  public abstract mapAdminAgentOrClientUser(user: any): AdminAgentOrClientUser

  public abstract mapDestination(res: any): Destination
  public abstract mapPaginatedDestinations(res: any): PaginatedDestination
  public abstract mapDestinationTableRow (destination: Destination): DestinationsTableRow

  public abstract mapUser(res: any): User
  public abstract mapUsers(res: any): User[]
  public abstract mapPaginatedUsers(res: any): PaginatedUser
  public abstract mapUserCredentials(res: any): UserCredentialsOptions

  public abstract mapFav(res: any): Fav
  public abstract mapFavs(res: any): Fav[]
  public abstract mapClientFavs(favs: any[]): ClientFavDestination[]

  public abstract mapClient(res: any): Client
  public abstract mapClients(res: any): Client[]
  public abstract mapPaginatedClients(res: any): PaginatedClient

  public abstract mapAgent(res: any): TravelAgent
  public abstract mapPaginatedAgents(res: any): PaginatedData<any>
  public abstract mapAgentTableRow(res: any): AgentsTableRow

  public abstract mapBooking(res: any): Booking
  public abstract mapBookings(res: any): Booking[]
  public abstract mapPaginatedBookings(res: any): PaginatedBooking
  public abstract mapBookingTableRow (role: Role, booking: Booking, client?: ClientRowInfo, agent?: AgentRowInfo): BookingsTableRow

  protected abstract mapImage(res: any): Media | undefined;

  // Map to API

  public abstract mapNewDestinationPayload(destination: NewDestination): any;
  public abstract mapDestinationPayload(destination: Destination): any;
  public abstract mapFavPayload(fav: NewFav): any;
  public abstract mapNewExtUserPayload(user: any): any;
  public abstract mapExtUserPayload(user: any): any;
  public abstract mapUserCredentialsPayload(user: User): any;
  public abstract mapClientPayload(client: NewClient): any
  public abstract mapAgentPayload(client: NewTravelAgent): any
  public abstract mapNewBookingPayload(booking: NewBooking): any;
  public abstract mapBookingPayload(booking: Booking): any;
}
