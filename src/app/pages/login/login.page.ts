import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { UserCredentials } from 'src/app/core/models/globetrotting/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnDestroy {
  private _subs: Subscription[] = []
  public errMsg: string = "";

  constructor(
    private authFacade: AuthFacade,
    private router: Router
  ) { }


  /**
 * Logs in a user with the provided credentials.
 *
 * This method uses the auth facade to log in a user using their credentials.
 *
 * @param credentials The user's login credentials including username and password.
 */
  public login(credentials: UserCredentials) {
    this.authFacade.login(credentials);
  }

  /**
   * Navigates to the home page.
   *
   * This method redirects the user to the home page using the Angular router.
   */
  public navigateHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Navigates to the register page.
   *
   * This method redirects the user to the register page using the Angular router.
   */
  public navigateToRegister() {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
  }

}