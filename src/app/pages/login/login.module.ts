import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';

// PrimeNg
import { PrimengModule } from 'src/app/shared/primeng.module';
import { SharedModule } from 'primeng/api';

@NgModule({
  imports: [
    SharedModule,
    LoginPageRoutingModule,
    PrimengModule,
  ],
  declarations: [
    LoginPage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPageModule { }
