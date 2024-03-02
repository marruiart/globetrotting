import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin, of, tap, zip } from 'rxjs';
import { User, UserCredentials } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { UsersService } from './users.service';
import { QueryConstraint, Unsubscribe, where } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';
import { Roles, StrapiEndpoints } from '../../utilities/utilities';
import { FormChanges } from 'src/app/shared/components/user-form/user-form.component';

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

  /**
 * 
 * @param user any value to be updated in a user
 * @param updateObs 
 * @returns 
 */
  public override updateUser(user: User & UserCredentials & FormChanges): Observable<any> {
    const body = this.mappingSvc.mapExtUserPayload(user);
    if (user.formChanges) {
      let obs: Observable<{ [field: string]: any }>[] = [];
      Object.entries(user.formChanges).forEach(([key, value]) => {
        if (key in body && value) {
          obs.push(this.dataSvc.updateField<{ [field: string]: any }>(StrapiEndpoints.EXTENDED_USERS, user.user_id, key, (user as any)[key], this.mappingSvc.mapUser));
        }
      });
      return forkJoin(obs);
    } else {
      return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.user_id, body, this.mappingSvc.mapUser);
    }
  }
}
