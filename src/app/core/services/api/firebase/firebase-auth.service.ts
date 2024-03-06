import { inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { FirebaseDocument, FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { FirebaseUserCredentials } from 'src/app/core/models/firebase-interfaces/firebase-user.interface';
import { AdminAgentOrClientUser, AgentRegisterInfo, AgentUser, ClientUser, UserCredentials, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { Collections, Role, Roles } from 'src/app/core/utilities/utilities';
import { AuthService } from '../../auth/auth.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { MappingService } from '../mapping.service';

export class FirebaseAuthService extends AuthService {
  private authFacade = inject(AuthFacade);
  private firebaseSvc = inject(FirebaseService);
  private mappingSvc = inject(MappingService);

  public getRoles(): Observable<any> {
    throw new Error('Method not implemented.');
  }

  public login(credentials: UserCredentials): Observable<void> {
    return new Observable<any>(observer => {
      if (!credentials.email || !credentials.password) {
        observer.error('Error: The provided credentials are incorrect or incomplete.');
      }
      this.firebaseSvc.connectUserWithEmailAndPassword(credentials.email!, credentials.password!)
        .then((credentials: FirebaseUserCredential | null) => {
          if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid) {
            observer.error('Error: Login failed.');
          } else {
            observer.next();
            observer.complete();
          }
        });
    });
  }

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

  public logout(): Observable<any> {
    return from(this.firebaseSvc.signOut(false));
  }

  public override updateIdentifiers(user: any): Observable<FirebaseUserCredentials> {
    console.log("updateIdentifiers", user);
    throw new Error('Method not implemented.');
  }
  public override getUserIdentifiers(id: number): Observable<FirebaseUserCredentials> {
    throw new Error('Method not implemented.');
  }
  public override deleteUser(user_id: string): Observable<void> {
    // TODO delete Authentication of the user
    return from(this.firebaseSvc.deleteDocument(Collections.USERS, user_id));
  }
}
