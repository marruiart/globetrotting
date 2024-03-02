import { Timestamp } from "firebase/firestore";
import { ExtUser, User } from "../models/globetrotting/user.interface";
import { BatchUpdate, CollectionUpdates } from "../models/firebase-interfaces/firebase-data.interface";

export const isType = <T>(item: any): item is T => true;

export type FullName = {
  name: string,
  surname: string,
  nickname?: ''
}

export function getUserName(user: ExtUser | User | FullName): string {
  if (user && user.name) {
    return `${user?.name}${' ' + user?.surname ?? ''}`;
  } else if (user) {
    return user.nickname ?? '';
  } else {
    return '';
  }
}

export function timestampToYearMonthDay(timestamp: Timestamp): string {
  const milliseconds = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6);
  const date = new Date(milliseconds);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isoDateToTimestamp(isoDate: string) {
  const date = new Date(isoDate);
  const seconds = Math.min(Math.max(date.getTime() / 1000, -62167219200), 2678416406);
  const nanoseconds = (date.getTime() % 1000) * 1000000;
  return new Timestamp(seconds, nanoseconds);
}

export function getCollectionsChanges(updates: BatchUpdate): CollectionUpdates {
  let collectionUpdates: CollectionUpdates = {};
  Object.entries(updates).forEach(([_, collections]) => {
    Object.entries(collections).forEach(([collection, { fieldPath, value, fieldValue, fieldName }]) => {
      const update = fieldValue ? { fieldPath, value, fieldValue, fieldName } : null;
      if (collection in collectionUpdates && update) {
        collectionUpdates[collection].push({ ...update });
      } else if (update) {
        collectionUpdates[collection] = [{ ...update }];
      }
    })
  })
  return collectionUpdates;
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
  static DESTINATIONS: Collection = 'destinations'
  static USERS: Collection = 'users'
  static BOOKINGS: Collection = 'bookings'
}

export class Backends {
  static STRAPI: Strapi = 'Strapi'
  static FIREBASE: BackendTypes = 'Firebase'
}

export class StrapiEndpoints {
  static BOOKINGS = "/api/bookings"
  static USER_PERMISSIONS = "/api/users"
  static EXTENDED_USERS = "/api/extended-users"
  static ME = "/api/users/me"
  static REGISTER = "/api/auth/local/register"
  static LOGIN = "/api/auth/local"
  static ROLES = "/api/users-permissions/roles"
  static AGENTS = "/api/agents"
  static CLIENTS = "/api/clients"
  static DESTINATIONS = "/api/destinations"
  static FAVORITES = "/api/favorites"
}

export type FormType = "LOGIN" | "REGISTER" | "REGISTER_AGENT" | "PROFILE" | "UPDATE_AGENT";

export class FormTypes {
  static LOGIN: FormType = "LOGIN"
  static REGISTER: FormType = "REGISTER"
  static REGISTER_AGENT: FormType = "REGISTER_AGENT"
  static PROFILE: FormType = "PROFILE"
  static UPDATE_AGENT: FormType = "UPDATE_AGENT"
}