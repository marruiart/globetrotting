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
    private auth: AuthFacade,
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

/*   ngOnInit() {
    this.auth.role$.subscribe(role => {
      console.log(role);
    });
  } */


  public onLogin() {
    const credentials: UserCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    }

    this.auth.login(credentials);

/*     let sub = this.authSvc.login(credentials).subscribe({
      next: _ => {
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error(err);
      }
    });
    this._subs.push(sub); */
  }

  public onCreateAccount() {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
  }

}