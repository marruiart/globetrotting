import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { UsersService } from './users.service';
import { QueryConstraint, Unsubscribe, where } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';
import { Roles } from '../../utilities/utilities';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

@Injectable({
  providedIn: 'root'
})
export class SubscribableUsersService extends UsersService {
  private unsubscribe: Unsubscribe | null = null;
  private firebaseSvc = inject(FirebaseService);

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService,
  ) {
    super(dataSvc, mappingSvc);
    if (!this.unsubscribe) {
      this.subscribeToUsers();
    }
  }

  private subscribeToUsers() {
    const _users = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
    const byRole: QueryConstraint = where('role', '==', Roles.AUTHENTICATED);
    this.unsubscribe = this.firebaseSvc.subscribeToCollectionQuery('users', _users, byRole);
    _users.subscribe(clients => {
      if (clients) {
        this.clientsFacade.saveClients(clients.docs.map(client => this.mappingSvc.mapUser(client)));
      }
    });
  }

  public override getAllUsers(): Observable<User[]> {
    return of([]);
  }

  public override getAllClientsUsers(): Observable<User[]> {
    return this.getAllUsers();
  }
}
