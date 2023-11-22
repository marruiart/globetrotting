import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { DestinationCardComponent } from './components/destination-card/destination-card.component';
import { VirtualItemsPipe } from './pipes/virtual-items.pipe';
import { AuthModule } from '../core/libs/auth/auth.module';

@NgModule({
  declarations: [
    // Components
    HeaderComponent,
    FooterComponent,
    DestinationCardComponent,
    // Pipes
    VirtualItemsPipe
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    AuthModule
  ],
  exports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    // Components
    HeaderComponent,
    FooterComponent,
    DestinationCardComponent,
    // Pipes
    VirtualItemsPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
