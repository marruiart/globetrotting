import { Observable, from, map } from 'rxjs';
import { FirebaseService } from '../../firebase/firebase.service';
import { AuthService } from '../../auth/auth.service';
import { UserCredentials, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { User } from 'firebase/auth';

/* export class FirebaseAuthService extends AuthService {
  
  constructor(
    private firebaseSvc: FirebaseService
  ) {
    super();
  }

  public login(credentials: UserCredentials): Observable<any> {
    return new Observable<any>(subscr => {
      this.firebaseSvc.connectUserWithEmailAndPassword(credentials.username, credentials.password ?? '').then((credentials: FirebaseUserCredential | null) => {
        if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid) {
          subscr.error('Cannot login');
        }
        if (credentials) {
          this.me().subscribe(data => {
            this._user.next(data);
            this._logged.next(true);
            subscr.next(data);
            subscr.complete();
          });
        }
      })
    });
  }

  public register(info: UserRegisterInfo): Observable<any | null> {
    return new Observable<any>(subscr => {
      this.firebaseSvc.createUserWithEmailAndPassword(info.email, info.password ?? '').then((credentials: FirebaseUserCredential | null) => {
        if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid)
          subscr.error('Cannot register');
        if (credentials) {
          this.postRegister(info).subscribe(data => {
            this._user.next(data);
            this._logged.next(true);
            subscr.next(data);
            subscr.complete();
          });
        }
      })
    });
  }

  private postRegister(info: User): Observable<any> {
    if (info.uuid)
      return from(this.firebaseSvc.createDocumentWithId('users', {
        name: info.name,
        surname: info.surname,
        nickname: info.nickname,
        piture: info.picture ?? ""
      }, info.uuid))
    throw new Error('Error inesperado');
  }

  public me(): Observable<User> {
    if (this.firebaseSvc.user?.uid)
      return from(this.firebaseSvc.getDocument('users', this.firebaseSvc.user.uid)).pipe(map(data => {
        return {
          name: data.data['name'],
          surname: data.data['surname'],
          nickname: data.data['nickname'],
          picture: data.data['picture'] ?? "",
          uuid: data.id
        }
      }));
    else
      throw new Error('User is not connected');
  }

  public logout(): Observable<any> {
    return from(this.firebaseSvc.signOut(false));
  }

  public override updateIdentifiers(user: any): Observable<UserCredentials> {
    throw new Error('Method not implemented.');
  }
  public override getUserIdentifiers(id: number): Observable<UserCredentials> {
    throw new Error('Method not implemented.');
  }
  public override deleteUser(id: number): Observable<UserCredentials> {
    throw new Error('Method not implemented.');
  }
}
 */