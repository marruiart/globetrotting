import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  constructor(
    private authFacade: AuthFacade,
    private router: Router
  ) { }

  /**
 * Navigates to the home page.
 *
 * @returns void
 */
  public navigateHome() {
    this.router.navigate(['/home']);
  }

  /**
 * Navigates to the login page.
 *
 * @returns void
 */
  public navigateLogin() {
    this.router.navigate(['/login']);
  }

  /**
 * Registers a new user with the provided credentials.
 *
 * @param credentials - The user's registration information.
 * @returns void
 */
  public doRegister(credentials: UserRegisterInfo) {
    this.authFacade.register(credentials);
  }
}
