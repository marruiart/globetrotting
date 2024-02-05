import { Observable, catchError, from, map, of, switchMap } from 'rxjs';
import { FirebaseService } from '../../firebase/firebase.service';
import { AuthService } from '../../auth/auth.service';
import { AgentRegisterInfo, AgentUser, ClientUser, Role, User, UserCredentials, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { FirebaseDocument, FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { inject } from '@angular/core';
import { FirebaseUserCredentials } from 'src/app/core/models/firebase-interfaces/firebase-user.interface';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';

export class FirebaseAuthService extends AuthService {
  private authFacade: AuthFacade = inject(AuthFacade);

  constructor(
    private firebaseSvc: FirebaseService
  ) {
    super();
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
    const _agentInfo = (registerInfo as AgentRegisterInfo) ?? undefined;
    const nickname = (registerInfo as AgentRegisterInfo).nickname ?? registerInfo.username;
    const role = isAgent ? 'AGENT' : 'AUTHENTICATED';

    return new Observable<any>(observer => {
      if (!registerInfo.email || !registerInfo.password) {
        observer.error('Error: The provided information is incorrect or incomplete.');
      }
      this.firebaseSvc.createUserWithEmailAndPassword(registerInfo.email, registerInfo.password!)
        .then((credentials: FirebaseUserCredential | null) => {
          if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid) {
            observer.error('Error: Registration failed.');
          }
          if (credentials) {
            if (credentials.user.user.uid) {
              let userInfo: User;
              if (isAgent) {
                userInfo = {
                  role: 'AGENT',
                  user_id: credentials.user.user.uid,
                  username: registerInfo.username,
                  email: registerInfo.email,
                  nickname: nickname,
                  name: _agentInfo.name,
                  surname: _agentInfo.surname,
                  bookings: [],
                } as AgentUser
              } else {
                userInfo = {
                  role: 'AUTHENTICATED',
                  user_id: credentials.user.user.uid,
                  username: registerInfo.username,
                  email: registerInfo.email,
                  nickname: nickname,
                  bookings: [],
                  favorites: []
                } as ClientUser;
              }
              this.postRegister(userInfo).subscribe({
                next: _ => {
                  observer.next(userInfo);
                  observer.complete();
                },
                error: error => observer.error(error.message)
              });
            } else {
              observer.error('Error: Registration failed. No UID was provided.');
            }
          }
        })
    });
  }

  private postRegister(userInfo: User): Observable<any> {
    // TODO FirebaseRegisterPayload
    return from(this.firebaseSvc.createDocumentWithId('users', {
      role: userInfo.role,
      username: userInfo.username,
      email: userInfo.email,
      nickname: userInfo.nickname,
      name: userInfo.name ?? '',
      surname: userInfo.surname ?? ''
    }, userInfo.user_id.toString())).pipe(
      switchMap(_ => from(this.firebaseSvc.createDocumentWithId('favorites', { destinations: [] }, userInfo.user_id.toString()))),
      catchError(error => of(error))
    );
  }

  public me(): Observable<User> {

    return new Observable<User>(observer => {
      this.authFacade.userId$.pipe(map(async uid => {
        if (uid) {
          try {
            const doc: FirebaseDocument = await this.firebaseSvc.getDocument('users', `${uid}`); // no cambiar el uid, debe ser string
            const role = doc.data['role'] as Role;
            let user: User; // TODO funciones de mapeo
            if (role === 'ADMIN' || role === 'AGENT') {
              user = {
                role: 'AGENT',
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
