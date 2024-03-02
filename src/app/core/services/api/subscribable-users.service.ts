import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { User, UserCredentials } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { UsersService } from './users.service';
import { QueryConstraint, Unsubscribe, where } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse, FormChanges } from '../../models/firebase-interfaces/firebase-data.interface';
import { Role, Roles, StrapiEndpoints, getCollectionsChanges } from '../../utilities/utilities';
import { AuthFacade } from '../../+state/auth/auth.facade';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }
@Injectable({
  providedIn: 'root'
})
export class SubscribableUsersService extends UsersService {
  private unsubscribe: Unsubscribe | null = null;
  private firebaseSvc = inject(FirebaseService);
  private authFacade = inject(AuthFacade);
  private _role: Role | null = null;

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService,
  ) {
    super(dataSvc, mappingSvc);
    this.authFacade.role$.subscribe(role => this._role = role);
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
    if (user.updates) {
      const updates = getCollectionsChanges(user.updates);
      return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.user_id, body, this.mappingSvc.mapUser).pipe(
        tap(_ => this.firebaseSvc.batchUpdateCollections(updates))
      )
    } else {
      return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.user_id, body, this.mappingSvc.mapUser);
    }
  }
}
