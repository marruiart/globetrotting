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
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { translateLoaderFactory } from './core/factories/translate-loader.factory';

import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';
import { DataService } from './core/services/api/data.service';
import { ApiService } from './core/services/api/api.service';
import { DataServiceFactory } from './core/factories/data-service.factory';
import { JwtService } from './core/services/auth/jwt.service';
import { FavoritesService } from './core/services/api/favorites.service';
import { FavoritesServiceFactory } from './core/factories/favorites-service.factory';
import { FavoritesModule } from './core/+state/favorites/favorites.module';
import { DestinationsModule } from './core/+state/destinations/destinations.module';
import { DestinationsService } from './core/services/api/destinations.service';
import { DestinationsServiceFactory } from './core/factories/destinations-service.factory';
import { AgentServiceFactory } from './core/factories/agent-service.factory';
import { AgentService } from './core/services/api/agent.service';
import { AgentsModule } from './core/+state/agents/agents.module';
import { BookingsModule } from './core/+state/bookings/bookings.module';
import { BookingsService } from './core/services/api/bookings.service';
import { BookingsServiceFactory } from './core/factories/bookings-service.factory';
import { ClientsModule } from './core/+state/clients/clients.module';

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
    FavoritesModule,
    DestinationsModule,
    AgentsModule,
    BookingsModule,
    ClientsModule
  ],
  providers: [
    DatePipe,
    // PrimeNG
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
      deps: ['backend', JwtService, ApiService],
      useFactory: AuthServiceFactory
    },
    {
      provide: DataService,
      deps: ['backend', ApiService],
      useFactory: DataServiceFactory,
    },
    {
      provide: FavoritesService,
      deps: ['backend', DataService, MappingService],
      useFactory: FavoritesServiceFactory,
    },
    {
      provide: DestinationsService,
      deps: ['backend', DataService, MappingService],
      useFactory: DestinationsServiceFactory,
    },
    {
      provide: AgentService,
      deps: ['backend', DataService, MappingService],
      useFactory: AgentServiceFactory,
    },
    {
      provide: BookingsService,
      deps: ['backend', DataService, MappingService],
      useFactory: BookingsServiceFactory,
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
