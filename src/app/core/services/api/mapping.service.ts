import { Injectable } from '@angular/core';
import { Destination, NewDestination, PaginatedDestination, emptyDestination } from '../../models/globetrotting/destination.interface';
import { User } from '../../models/globetrotting/user.interface';
import { Media } from '../../models/globetrotting/media.interface';
import { emptyPaginatedData } from '../../models/globetrotting/pagination-data.interface';
import { Fav } from '../../models/globetrotting/fav.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class MappingService {

  constructor() { }

  // Map to app

  public mapDestination = (res: any): Destination => emptyDestination

  public mapDestinations = (res: any): PaginatedDestination => emptyPaginatedData

  public abstract mapUser(res: any): User

  public abstract mapUsers(res: any): User[]

  protected abstract mapImage(res: any): Media | undefined;

  // Map to API

  public abstract mapDestinationPayload(destination: NewDestination): any;

}
