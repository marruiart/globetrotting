import { Component } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { AdminAgentOrClientUser, User, UserCredentials } from 'src/app/core/models/globetrotting/user.interface';
import { UsersService } from 'src/app/core/services/api/users.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { FormChanges } from 'src/app/shared/components/user-form/user-form.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  private readonly COMPONENT = 'ProfilePage';
  public user: AdminAgentOrClientUser | null = null;

  constructor(
    private authFacade: AuthFacade,
    private authSvc: AuthService,
    private subsSvc: SubscriptionsService,
    private userSvc: UsersService
  ) {

    this.subsSvc.addSubscriptions(this.COMPONENT,
      this.authFacade.currentUser$.subscribe(user => this.user = user)
    );
  }

  public async updateProfile(_user: User & UserCredentials & FormChanges | null) {
    if (_user?.user_id && _user.ext_id) {
      await lastValueFrom(this.userSvc.updateUser(_user)).catch(err => console.error(err));
      await lastValueFrom(this.authSvc.updateIdentifiers(_user)).catch(err => console.error(err));
    } else {
      console.error("ERROR: Unexpected error. The profile could not be updated.");
    }
  }

}
