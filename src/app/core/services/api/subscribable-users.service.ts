import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, from, of, switchMap, tap } from 'rxjs';
import { User, UserCredentials } from '../../models/globetrotting/user.interface';
import { MappingService } from './mapping.service';
import { DataService } from './data.service';
import { UsersService } from './users.service';
import { QueryConstraint, Unsubscribe, where } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';
import { Role, Roles, StrapiEndpoints } from '../../utilities/utilities';
import { BatchUpdate, FormChanges } from 'src/app/shared/components/user-form/user-form.component';
import { AuthFacade } from '../../+state/auth/auth.facade';

export class LoginErrorException extends Error { }
export class UserNotFoundException extends Error { }
type CollectionUpdates = {
  [collection: string]: [
    {
      fieldPath: string,
      value: string | number,
      fieldName: string,
      fieldValue: any
    }
  ]
};
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

  private getCollectionsChanges(updates: BatchUpdate): CollectionUpdates {
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

  /**
   * 
   * @param user any value to be updated in a user
   * @param updateObs 
   * @returns 
   */
  public override updateUser(user: User & UserCredentials & FormChanges): Observable<any> {
    const body = this.mappingSvc.mapExtUserPayload(user);
    if (user.updates) {
      const updates = this.getCollectionsChanges(user.updates);
      return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.user_id, body, this.mappingSvc.mapUser).pipe(
        tap(_ => {
          Object.entries(updates).map(([collection, updates]) => {
            updates.forEach(async ({ fieldPath, value, fieldValue, fieldName }) => {
              const docs = await this.firebaseSvc.getDocumentsBy(collection, fieldPath, value);
              const docsId = docs.map(({ id }) => id);
              if (docs.length) {
                await this.firebaseSvc.batchUpdateDocuments(collection, fieldName, fieldValue, ...docsId);
              }
            })
          })
        })
      )
    } else {
      return this.dataSvc.update<User>(StrapiEndpoints.EXTENDED_USERS, user.user_id, body, this.mappingSvc.mapUser);
    }
  }
}
