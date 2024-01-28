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

  public login(credentials: UserCredentials) {
    this.authFacade.login(credentials);
  }

  public navigateHome() {
    this.router.navigate(['/home']);
  }

  public navigateToRegister() {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
  }

}