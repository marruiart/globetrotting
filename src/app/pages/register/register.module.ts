import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthModule } from '../../core/libs/auth/auth.module';

@NgModule({
  imports: [
    SharedModule,
    RegisterPageRoutingModule,
    PrimengModule,
    AuthModule
  ],
  declarations: [RegisterPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegisterPageModule {}
