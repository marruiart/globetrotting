import { ExtUser, User } from "../models/globetrotting/user.interface";

export const isType = <T>(item: any): item is T => true;

export function getUserName(user: ExtUser | User): string {
  if (user && user.name) {
    return `${user?.name}${' ' + user?.surname ?? ''}`;
  } else if (user) {
    return user.nickname;
  } else {
    return '';
  }
}

// TYPES
export type Strapi = 'Strapi';
export type Firebase = 'Firebase';
export type BackendTypes = Firebase | Strapi;
export type Role = 'ADMIN' | 'AGENT' | 'AUTHENTICATED';
export type Collection = 'destinations' | 'users' | 'bookings';

// CONSTANTS
export class Roles {
  static AUTHENTICATED: Role = 'AUTHENTICATED'
  static ADMIN: Role = 'ADMIN'
  static AGENT: Role = 'AGENT'
}

export class Collections {
  static destinations: Collection = 'destinations'
  static users: Collection = 'users'
  static bookings: Collection = 'bookings'
}

export class Backends {
  static STRAPI: BackendTypes = 'Strapi'
  static FIREBASE: BackendTypes = 'Firebase'
}