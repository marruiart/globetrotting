import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { SharedModule } from 'src/app/shared/shared.module';

// PrimeNg

@NgModule({
  imports: [
    SharedModule,
    LoginPageRoutingModule
    ],
  declarations: [
    LoginPage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPageModule { }
