import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { UserCredentials } from 'src/app/core/models/globetrotting/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnDestroy {
  private _subs: Subscription[] = []
  public loginForm: FormGroup;
  public errMsg: string = "";

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
      ]],
      password: ['', Validators.required]
    });
  }

  public onLogin() {
    const credentials: UserCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    }

    this.authFacade.login(credentials);
  }

  public onCreateAccount() {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
  }

}