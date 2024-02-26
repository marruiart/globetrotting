import { ExtUser, AdminAgentOrClientUser, User } from "../models/globetrotting/user.interface";

export const isType = <T>(item: any): item is T => true;

export function getClientName(clientExtUser: ExtUser | User): string {
    if (clientExtUser && clientExtUser.name) {
      return `${clientExtUser?.name}${' ' + clientExtUser?.surname ?? ''}`;
    } else if (clientExtUser) {
      return clientExtUser.nickname;
    } else {
      return '';
    }
  }

export class Roles {
  static AUTHENTICATED = 'AUTHENTICATED'
  static ADMIN = 'ADMIN'
  static AGENT = 'AGENT'
}