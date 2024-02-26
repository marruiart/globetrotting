import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { UsersService } from './users.service';
import { Unsubscribe } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';
import { Roles } from '../../utilities/utilities';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }

@Injectable({
  providedIn: 'root'
})
export class SubscribableUsersService extends UsersService {
  private unsubscribe!: Unsubscribe | null;
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
    this.unsubscribe = this.firebaseSvc.subscribeToCollection('users', _users);
    _users.subscribe(res => {
      if (res) {
        const clients = res.docs.filter(doc => doc.data['role'] === Roles.AUTHENTICATED)
        this.clientsFacade.saveClients(clients.map(client => this.mappingSvc.mapUser(client)));
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
