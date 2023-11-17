import { Injectable } from '@angular/core';
import { Destination } from '../../models/destination.interface';
import { StrapiDestination } from '../../models/strapi-interfaces/strapi-destination';
import { User } from '../../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class MapService {

  constructor() { }

  public abstract mapDestination(res: any): Destination

  public abstract mapDestinations(res: any): Destination[]

  public abstract mapUser(res: any): User

  public abstract mapUsers(res: any): User[]

}
