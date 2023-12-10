import { Component } from '@angular/core';
import { Observable, catchError, lastValueFrom, of, switchMap } from 'rxjs';
import { UserFacade } from 'src/app/core/+state/load-user/load-user.facade';
import { FullUser } from 'src/app/core/models/globetrotting/user.interface';
import { UsersService } from 'src/app/core/services/api/users.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  public user: FullUser | null = null;

  constructor(
    private userFacade: UserFacade,
    private authSvc: AuthService,
    private subsSvc: SubscriptionsService,
    private userSvc: UsersService
  ) {
    this.subsSvc.addSubscription({
      component: "ProfilePage",
      sub: this.userFacade.currentUser$.pipe(
        switchMap((currentUser): Observable<FullUser | null> => {
          if (currentUser.user_id) {
            return this.authSvc.getUserIdentifiers(currentUser.user_id).pipe(
              switchMap((user): Observable<FullUser | null> => {
                const fullUser: FullUser = {
                  user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    password: null
                  },
                  extendedUser: currentUser.extendedUser,
                  specificUser: currentUser.specificUser
                };
                return of(fullUser);
              }), catchError(err => {
                console.error(err);
                return of(null);
              })
            );
          }
          else {
            return of(null);
          }
        }), catchError(err => {
          console.error(err);
          return of(null);
        })
      )
        .subscribe({
          next: (fullUser: FullUser | null) => {
            this.user = fullUser
          },
          error: err => console.error(err)
        })
    });
  }

  public updateProfile(fullUser: FullUser | null) {
    if (fullUser && fullUser.user && fullUser.extendedUser) {
      const extUser = {
        id: fullUser.extendedUser.id,
        name: fullUser.extendedUser.name,
        surname: fullUser.extendedUser.surname,
        nickname: fullUser.extendedUser.nickname
      }
      let identifiers;
      if (fullUser.user.password) {
        identifiers = {
          id: fullUser.user.id,
          email: fullUser.user.email,
          password: fullUser.user.password
        }
      } else {
        identifiers = {
          id: fullUser.user.id,
          email: fullUser.user.email,
        }
      }
      lastValueFrom(this.userSvc.updateUser(extUser))
        .catch(err => console.error(err));
      lastValueFrom(this.authSvc.updateIdentifiers(identifiers))
        .catch(err => console.error(err));
    } else {
      console.error("No se ha podido actualizar el perfil");
    }
  }

}
