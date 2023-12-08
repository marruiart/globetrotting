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
import { FavPipe } from './pipes/fav.pipe';
import { UserModule } from '../core/libs/load-user/load-user.module';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { DestinationFormComponent } from './components/destination-form/destination-form.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { translateLoaderFactory } from '../core/factories/translate-loader.factory';
import { ThemeSelectableComponent } from './components/theme-selector/theme-selectable.component';
import { ThemeSelectableItemComponent } from './components/theme-selector/theme-selectable-item/theme-selectable-item.component';

@NgModule({
  declarations: [
    // Components
    HeaderComponent,
    FooterComponent,
    DestinationCardComponent,
    BookingFormComponent,
    DestinationFormComponent,
    UserFormComponent,
    ThemeSelectableComponent,
    ThemeSelectableItemComponent,
    // Pipes
    VirtualItemsPipe,
    FavPipe
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    AuthModule,
    UserModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        deps: [HttpClient],
        useFactory: (translateLoaderFactory)
      }
    })
  ],
  exports: [
    PrimengModule,
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    // Components
    HeaderComponent,
    FooterComponent,
    DestinationCardComponent,
    BookingFormComponent,
    DestinationFormComponent,
    UserFormComponent,
    ThemeSelectableComponent,
    ThemeSelectableItemComponent,
    // Pipes
    VirtualItemsPipe,
    FavPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
