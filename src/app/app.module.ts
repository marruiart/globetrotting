import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthServiceFactory } from './core/factories/auth-service.factory';
import { AuthService } from './core/services/auth/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { httpServiceFactory } from './core/factories/http-service.factory';
import { HttpService } from './core/services/http/http.service';

import { MappingService } from './core/services/api/mapping.service';
import { MappingServiceFactory } from './core/factories/mapping-service.factory';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AuthModule } from './core/+state/auth/auth.module';
import { UserModule } from './core/+state/load-user/load-user.module';
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { translateLoaderFactory } from './core/factories/translate-loader.factory';

import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';
import { DataService } from './core/services/api/data.service';
import { ApiService } from './core/services/api/api.service';
import { DataServiceFactory } from './core/factories/data-service.factory';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    ButtonModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (translateLoaderFactory),
        deps: [HttpClient]
      }
    }),
    AuthModule,
    UserModule
  ],
  providers: [
    // PrimeNg
    DatePipe,
    ConfirmationService,
    MessageService,
    // General
    {
      provide: 'backend',
      useValue: environment.backend
    },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    {
      provide: MappingService,
      deps: ['backend'],
      useFactory: MappingServiceFactory
    },
    {
      provide: HttpService,
      deps: [HttpClient],
      useFactory: httpServiceFactory
    },
    {
      provide: AuthService,
      deps: ['backend'],
      useFactory: AuthServiceFactory
    },
    {
      provide: DataService,
      deps: ['backend', ApiService],
      useFactory: DataServiceFactory,  
    },
    {
      provide: 'firebase-config',
      useValue: environment.firebaseConfig
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
