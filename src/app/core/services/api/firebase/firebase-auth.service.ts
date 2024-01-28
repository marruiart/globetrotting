import { Observable, from, lastValueFrom, map, of, throwError } from 'rxjs';
import { FirebaseService } from '../../firebase/firebase.service';
import { AuthService } from '../../auth/auth.service';
import { AgentRegisterInfo, Role, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { FirebaseDocument, FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { AuthUser, AuthUserOptions } from 'src/app/core/models/globetrotting/auth.interface';
import { inject } from '@angular/core';
import { FirebaseAuthUser, FirebaseUserCredentials } from 'src/app/core/models/firebase-interfaces/firebase-user.interface';
import { UserFacade } from 'src/app/core/+state/load-user/load-user.facade';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';

export class FirebaseAuthService extends AuthService {
  private firebaseSvc: FirebaseService = inject(FirebaseService);
  private userFacade: UserFacade = inject(UserFacade);
  private authFacade: AuthFacade = inject(AuthFacade);

  constructor() {
    super();
  }

  public login(credentials: FirebaseUserCredentials): Observable<void> {
    return new Observable<any>(observer => {
      this.firebaseSvc.connectUserWithEmailAndPassword(credentials.email, credentials.password ?? '')
        .then((credentials: FirebaseUserCredential | null) => {
          if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid) {
            observer.error('Cannot login');
          } else {
            observer.next();
            observer.complete();
          }
        });
    });
  }

  public register(registerInfo: UserRegisterInfo | AgentRegisterInfo, isAgent: boolean = false): Observable<any | null> {
    throw new Error('Method not implemented.');
  }

  private postRegister(info: UserRegisterInfo): Observable<any> {
    throw new Error('Method not implemented.');
  }

  public me(): Observable<AuthUserOptions> {

    return new Observable<AuthUserOptions>(observer => {
      this.authFacade.userId$.subscribe({
        next: async uid => {
          if (uid) {
            try {
              const doc: FirebaseDocument = await this.firebaseSvc.getDocument(`${uid}`)
              const authUser: FirebaseAuthUser = {
                uid: doc.id,
                role: doc.data['role']['type'] as Role,
                nickname: doc.data['nickname'],
                name: doc.data['name'],
                surname: doc.data['surname'],
                age: doc.data['age']
              }
              observer.next(authUser);
              observer.complete();
            } catch (err) {
              observer.error(err);
            }
          }
        },
        error: error => {
          return observer.error(error);
        }
      });
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
