import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    RegisterPageRoutingModule
  ],
  declarations: [RegisterPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegisterPageModule {}
