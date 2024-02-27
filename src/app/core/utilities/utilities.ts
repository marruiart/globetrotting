import { ExtUser, AdminAgentOrClientUser, User } from "../models/globetrotting/user.interface";

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

export class Roles {
  static AUTHENTICATED = 'AUTHENTICATED'
  static ADMIN = 'ADMIN'
  static AGENT = 'AGENT'
}

export class Backends {
  static STRAPI = 'Strapi'
  static FIREBASE = 'Firebase'
}