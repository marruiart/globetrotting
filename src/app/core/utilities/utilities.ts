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
type Admin = 'ADMIN';
type Agent = 'AGENT';
type Authenticated = 'AUTHENTICATED';
export type Role = Admin | Agent | Authenticated;
export type Collection = 'destinations' | 'users' | 'bookings';

// CONSTANTS
export class Roles {
  static AUTHENTICATED: Authenticated = 'AUTHENTICATED'
  static ADMIN: Admin = 'ADMIN'
  static AGENT: Agent = 'AGENT'
}

export class Collections {
  static destinations: Collection = 'destinations'
  static users: Collection = 'users'
  static bookings: Collection = 'bookings'
}

export class Backends {
  static STRAPI: Strapi = 'Strapi'
  static FIREBASE: BackendTypes = 'Firebase'
}

export class StrapiEndpoints {
  static USER_PERMISSIONS = "/api/users"
  static EXTENDED_USERS = "/api/extended-users"
  static ME = "/api/users/me"
  static REGISTER = "/api/auth/local/register"
  static LOGIN = "/api/auth/local"
  static ROLES = "/api/users-permissions/roles"
}