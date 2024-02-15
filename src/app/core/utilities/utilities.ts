import { ExtUser } from "../models/globetrotting/user.interface";

export const isType = <T>(item: any): item is T => true;

export function getClientName(clientExtUser: ExtUser): string {
    if (clientExtUser && clientExtUser.name) {
      return `${clientExtUser?.name}${' ' + clientExtUser?.surname ?? ''}`;
    } else if (clientExtUser) {
      return clientExtUser.nickname;
    } else {
      return '';
    }
  }