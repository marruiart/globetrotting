import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  public registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
      ]],
      password: ['', Validators.required],
      passwordRepeat: ['', Validators.required]
    });
  }

  public onRegister() {
    const credentials: UserRegisterInfo = {
      username: this.registerForm.value.email,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    }
    this.authSvc.register(credentials).subscribe({
      next: _ => {
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
