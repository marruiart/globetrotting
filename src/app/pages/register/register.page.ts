import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRegisterInfo } from 'src/app/core/models/user-register-info.interface';
import { AuthProvider } from 'src/app/core/services/auth/auth.provider';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  public registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthProvider,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
      ]],
      password: ['', Validators.required],
      passwordRepeat: ['', Validators.required]
    });
  }

  public onRegister() {
    const credentials: UserRegisterInfo = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.username,
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
