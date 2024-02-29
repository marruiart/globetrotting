import { Observable, catchError, from, map, of, switchMap } from 'rxjs';
import { FirebaseService } from '../../firebase/firebase.service';
import { AuthService } from '../../auth/auth.service';
import { AgentRegisterInfo, AgentUser, ClientUser, AdminAgentOrClientUser, UserCredentials, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { FirebaseDocument, FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { inject } from '@angular/core';
import { FirebaseUserCredentials } from 'src/app/core/models/firebase-interfaces/firebase-user.interface';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { Role, Roles } from 'src/app/core/utilities/utilities';
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

  private mapUserPayload(credentials: FirebaseUserCredential, registerInfo: UserRegisterInfo, isAgent: boolean) {
    const _agentInfo = (registerInfo as AgentRegisterInfo) ?? undefined;
    const nickname = (registerInfo as AgentRegisterInfo).nickname ?? registerInfo.username;

    const commonInfo = {
      user_id: credentials.user.user.uid,
      username: registerInfo.username,
      email: registerInfo.email,
      nickname: nickname
    };
    if (isAgent) {
      return {
        ...commonInfo,
        role: Roles.AGENT,
        name: _agentInfo.name,
        surname: _agentInfo.surname,
      } as AgentUser;
    } else {
      return {
        ...commonInfo,
        role: Roles.AUTHENTICATED,
        favorites: []
      } as ClientUser;
    }
  }

  public register(registerInfo: UserRegisterInfo | AgentRegisterInfo, isAgent: boolean = false): Observable<any | null> {

    return new Observable<any>(observer => {
      if (!registerInfo.email || !registerInfo.password) {
        observer.error('Error: The provided information is incorrect or incomplete.');
      }
      this.firebaseSvc.createUserWithEmailAndPassword(registerInfo.email, registerInfo.password!)
        .then((credentials: FirebaseUserCredential | null) => {
          if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid) {
            observer.error('Error: Registration failed.');
          }
          if (credentials?.user.user.uid) {
            const userInfo = this.mapUserPayload(credentials, registerInfo, isAgent);
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
        })
    });
  }

  private postRegister(userInfo: AdminAgentOrClientUser): Observable<any> {
    // TODO FirebaseRegisterPayload
    return from(this.firebaseSvc.createDocumentWithId('users', userInfo, `${userInfo.user_id}`));
  }

  public me(): Observable<AdminAgentOrClientUser> {

    return new Observable<AdminAgentOrClientUser>(observer => {
      this.authFacade.userId$.pipe(map(async uid => {
        if (uid) {
          try {
            const doc: FirebaseDocument = await this.firebaseSvc.getDocument('users', `${uid}`); // no cambiar el uid, debe ser string
            const role = doc.data['role'] as Role;
            let user: AdminAgentOrClientUser; // TODO funciones de mapeo
            if (role === 'ADMIN' || role === 'AGENT') {
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
    throw new Error('Method not implemented.');
  }
  public override getUserIdentifiers(id: number): Observable<FirebaseUserCredentials> {
    throw new Error('Method not implemented.');
  }
  public override deleteUser(id: number): Observable<FirebaseUserCredentials> {
    throw new Error('Method not implemented.');
  }
}
