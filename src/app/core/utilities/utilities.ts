import { Timestamp } from 'firebase/firestore';
import { BatchUpdate, CollectionUpdates, FieldUpdate } from '../models/firebase-interfaces/firebase-data.interface';
import { ExtUser, User } from '../models/globetrotting/user.interface';

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

export function getCollectionsChanges(batchUpdates: BatchUpdate): CollectionUpdates {
  let fieldUpdates: { [updateId: string]: (FieldUpdate & { collection: string })[] } = {};
  let collectionUpdates: CollectionUpdates = {};
  Object.entries(batchUpdates).forEach(([_, collections]) => {
    Object.entries(collections).forEach(([collection, updates]) => {
      updates.forEach(({ fieldPath, value, fieldName, fieldValue }) => {
        const updateId = `${fieldPath}#${value}`;
        if (updateId in fieldUpdates && fieldValue) {
          fieldUpdates[updateId].push({ collection, fieldName, fieldValue });
        } else if (fieldValue) {
          fieldUpdates[updateId] = [{ collection, fieldName, fieldValue }];
        }
      })
    })
  })
  Object.entries(fieldUpdates).forEach(([updateId, updates]) => {
    const [fieldPath, value] = updateId.split('#');
    updates.forEach(({ collection }) => {
      const _updates: FieldUpdate[] = updates.map(({ fieldName, fieldValue }) => ({ fieldName, fieldValue }))
      if (collection in collectionUpdates) {
        collectionUpdates[collection].push({ fieldPath, value, fieldUpdates: [..._updates] });
      } else {
        collectionUpdates[collection] = [{ fieldPath, value, fieldUpdates: [..._updates] }];
      }
    })
  })
  return collectionUpdates;
}

// TYPES
export type Strapi = 'Strapi';
export type Firebase = 'Firebase';
export type Backend = Firebase | Strapi;

type Admin = 'ADMIN';
type Agent = 'AGENT';
type Authenticated = 'AUTHENTICATED';
export type Role = Admin | Agent | Authenticated;

type Destinations = 'destinations';
type Users = 'users';
type Bookings = 'bookings';
export type Collection = Destinations | Users | Bookings;

export type FormType = 'LOGIN' | 'REGISTER' | 'REGISTER_AGENT' | 'PROFILE' | 'UPDATE_AGENT';

// CONSTANTS
export const Roles = {
  AUTHENTICATED: 'AUTHENTICATED' as Authenticated,
  ADMIN: 'ADMIN' as Admin,
  AGENT: 'AGENT' as Agent
}

export const Collections = {
  DESTINATIONS: 'destinations' as Destinations,
  USERS: 'users' as Users,
  BOOKINGS: 'bookings' as Bookings
}

export const Backends = {
  STRAPI: 'Strapi' as Strapi,
  FIREBASE: 'Firebase' as Firebase
}

export const StrapiEndpoints = {
  BOOKINGS: '/api/bookings',
  USER_PERMISSIONS: '/api/users',
  EXTENDED_USERS: '/api/extended-users',
  ME: '/api/users/me',
  REGISTER: '/api/auth/local/register',
  LOGIN: '/api/auth/local',
  ROLES: '/api/users-permissions/roles',
  AGENTS: '/api/agents',
  CLIENTS: '/api/clients',
  DESTINATIONS: '/api/destinations',
  FAVORITES: '/api/favorites'
}

export const FIREBASE_API_URL = 'https://europe-west9-globetrotting-80e83.cloudfunctions.net'

export const FirebaseEndpoints = {
  DOWNLOAD_CSV: '/function-export-to-csv'
}

export const FormTypes = {
  LOGIN: 'LOGIN' as 'LOGIN',
  REGISTER: 'REGISTER' as 'REGISTER',
  REGISTER_AGENT: 'REGISTER_AGENT' as 'REGISTER_AGENT',
  PROFILE: 'PROFILE' as 'PROFILE',
  UPDATE_AGENT: 'UPDATE_AGENT' as 'UPDATE_AGENT'
}
