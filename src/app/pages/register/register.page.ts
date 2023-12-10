import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  constructor(
    private authFacade: AuthFacade,
    private authSvc: AuthService,
    private router: Router
  ) {  }

  public doRegister(credentials: UserRegisterInfo) {
    this.authFacade.register(credentials);
  }
}
