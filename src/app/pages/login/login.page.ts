import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserCredentials } from 'src/app/core/models/user-credentials.interface';

import { AuthProvider } from 'src/app/core/services/auth/auth.provider';

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
    private authSvc: AuthProvider,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [
        Validators.required,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
      ]],
      password: ['', Validators.required]
    });
  }

  public onLogin() {
    const credentials: UserCredentials = {
      username: this.loginForm.value.identifier,
      password: this.loginForm.value.password
    }
    let sub = this.authSvc.login(credentials).subscribe({
      next: _ => {
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error(err);
      }
    });
    this._subs.push(sub);
  }

  public onCreateAccount() {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
  }

}