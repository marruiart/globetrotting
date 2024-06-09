import { inject } from '@angular/core';
import { deleteField } from 'firebase/firestore';
import { Observable, from, lastValueFrom, map } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { CollectionUpdates, FirebaseDocument, FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { FirebaseUserCredentials } from 'src/app/core/models/firebase-interfaces/firebase-user.interface';
import { AdminAgentOrClientUser, AgentRegisterInfo, AgentUser, ClientUser, UserCredentials, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { Collections, Role, Roles } from 'src/app/core/utilities/utilities';
import { AuthService } from '../../auth/auth.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { MappingService } from '../mapping.service';
import { UserCredential } from 'firebase/auth';

export class FirebaseAuthService extends AuthService {
  private authFacade = inject(AuthFacade);
  private firebaseSvc = inject(FirebaseService);
  private mappingSvc = inject(MappingService);

  /**
 * Placeholder method for retrieving roles. Currently not implemented.
 *
 * @returns {Observable<any>} - Throws an error indicating the method is not implemented.
 */
  public getRoles(): Observable<any> {
    throw new Error('Method not implemented.');
  }

  /**
 * Logs in a user with the provided credentials.
 *
 * This function takes user credentials, verifies them, and if valid,
 * logs the user in through Firebase authentication service. Upon successful
 * login, it returns an observable containing the user's ID token.
 *
 * @param {UserCredentials} credentials - The credentials of the user attempting to log in.
 * @returns {Observable<string>} - An observable containing the user's ID token upon successful login.
 */
  public login(credentials: UserCredentials): Observable<string> {
    return new Observable<any>(observer => {
      if (!credentials.email || !credentials.password) {
        observer.error('Error: The provided credentials are incorrect or incomplete.');
      }
      this.firebaseSvc.connectUserWithEmailAndPassword(credentials.email!, credentials.password!)
        .then((credentials: UserCredential | null) => {
          if (!credentials || !credentials.user || !credentials.user || !credentials.user.uid) {
            observer.error('Error: Login failed.');
          } else {
            credentials.user.getIdToken().then(token => {
              observer.next(token);
              observer.complete();
            });
          }
        });
    });
  }

  /**
 * Registers a new user or agent with the provided registration information.
 *
 * This function takes registration information, determines whether the registration
 * is for a user or an agent, and registers the user/agent through Firebase authentication
 * service. Upon successful registration, it returns an observable containing the registered
 * user information.
 *
 * @param {UserRegisterInfo | AgentRegisterInfo} registerInfo - The registration information of the user or agent.
 * @param {boolean} [isAgent=false] - Flag indicating whether the registration is for an agent.
 * @returns {Observable<any | null>} - An observable containing the registered user information upon successful registration.
 */
  public register(registerInfo: UserRegisterInfo | AgentRegisterInfo, isAgent: boolean = false): Observable<any | null> {

    return new Observable<any>(observer => {
      if (!registerInfo.email || !registerInfo.password) {
        observer.error('Error: The provided information is incorrect or incomplete.');
      }
      const promise = isAgent ?
        this.firebaseSvc.createAgent(registerInfo.email, registerInfo.password!) :
        this.firebaseSvc.createUser(registerInfo.email, registerInfo.password!);

      promise.then((credentials: FirebaseUserCredential | null) => {
        if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid) {
          observer.error('Error: Registration failed.');
        }
        if (credentials?.user.user.uid) {
          const userInfo = this.mappingSvc.mapNewExtUserPayload({ ...credentials, ...registerInfo }, isAgent);
          this.postRegister(userInfo).subscribe({
            next: _ => {
              observer.next(userInfo);
              observer.complete();
            },
            error: error => observer.error(error.message)
          });
        } else {
          observer.error('Error: Registration failed. Invalid credentials.');
        }
      }).catch(err => observer.error(err));
    });
  }

  private postRegister(userInfo: AdminAgentOrClientUser): Observable<any> {
    // TODO FirebaseRegisterPayload
    return from(this.firebaseSvc.createDocumentWithId(Collections.USERS, userInfo, `${userInfo.user_id}`));
  }

  /**
 * Retrieves the current user as an observable.
 *
 * @returns {Observable<AdminAgentOrClientUser>} An observable of the current user.
 */
  public me(): Observable<AdminAgentOrClientUser> {

    return new Observable<AdminAgentOrClientUser>(observer => {
      this.authFacade.userId$.pipe(map(async uid => {
        if (uid) {
          try {
            const doc: FirebaseDocument = await this.firebaseSvc.getDocument(Collections.USERS, `${uid}`); // no cambiar el uid, debe ser string
            const role = doc.data['role'] as Role;
            let user: AdminAgentOrClientUser; // TODO funciones de mapeo
            if (role === Roles.ADMIN || role === Roles.AGENT) {
              user = {
                role: role,
                user_id: uid,
                username: doc.data['username'],
                email: doc.data['email'],
                nickname: doc.data['nickname'],
                name: doc.data['name'],
                surname: doc.data['surname'],
                bookings: doc.data['bookings'] ?? [],
              } as AgentUser
            } else {
              user = {
                role: 'AUTHENTICATED',
                user_id: uid,
                username: doc.data['username'],
                email: doc.data['email'],
                nickname: doc.data['nickname'],
                bookings: doc.data['bookings'] ?? [],
                favorites: doc.data['favorites'] ?? []
              } as ClientUser;
            }
            observer.next(user);
            observer.complete();
          } catch (err) {
            observer.error(err);
          }
        }
        observer.error('Error: User UID was not provided.');
      })).subscribe();
    });
  }

  /**
 * Logs out the current user.
 *
 * @returns {Observable<any>} An observable indicating the logout process.
 */
  public logout(): Observable<any> {
    return from(this.firebaseSvc.signOut(false));
  }

  /**
 * Updates the identifiers for a given user.
 *
 * @param {any} user - The user whose identifiers will be updated.
 * @returns {Observable<FirebaseUserCredentials>} An observable of the updated user credentials.
 * @throws {Error} Method not implemented.
 */
  public override updateIdentifiers(user: any): Observable<FirebaseUserCredentials> {
    console.log("updateIdentifiers", user);
    throw new Error('Method not implemented.');
  }

  /**
 * Retrieves the identifiers for a given user by ID.
 *
 * @param {number} id - The ID of the user whose identifiers will be retrieved.
 * @returns {Observable<FirebaseUserCredentials>} An observable of the user credentials.
 * @throws {Error} Method not implemented.
 */
  public override getUserIdentifiers(id: number): Observable<FirebaseUserCredentials> {
    throw new Error('Method not implemented.');
  }

  /**
 * Deletes a user by user ID.
 *
 * @param {string} user_id - The ID of the user to delete.
 * @returns {Observable<void>} An observable indicating the delete process.
 */
  public override deleteUser(user_id: string): Observable<void> {
    // TODO Update to delete clients when it is available
    return from(this.firebaseSvc.deleteDocument(Collections.USERS, user_id).then(_ => {
      const updates: CollectionUpdates = {
        [Collections.BOOKINGS]: [{
          fieldPath: 'agent_id',
          value: user_id,
          fieldUpdates: [
            {
              fieldName: 'agent_id',
              fieldValue: deleteField()
            },
            {
              fieldName: 'agentName',
              fieldValue: deleteField()
            },
            {
              fieldName: 'isConfirmed',
              fieldValue: false
            }
          ]
        }]
      }
      this.firebaseSvc.batchUpdateCollections(updates);
    }));
  }
}
