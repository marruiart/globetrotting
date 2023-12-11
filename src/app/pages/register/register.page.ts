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
  ) {  }

  public navigateHome() {
    this.router.navigate(['/home']);
  }

  public navigateLogin() {
    this.router.navigate(['/login']);
  }

  public doRegister(credentials: UserRegisterInfo) {
    this.authFacade.register(credentials);
  }
}
