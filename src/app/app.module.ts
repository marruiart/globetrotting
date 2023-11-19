import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiService } from './core/services/api/api.service';
import { AuthServiceFactory } from './core/factories/auth-service.factory';
import { AuthService } from './core/services/auth/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { httpServiceFactory } from './core/factories/http-service.factory';
import { HttpService } from './core/services/http/http.service';
import { JwtService } from './core/services/auth/jwt.service';
import { MappingServiceFactory } from './core/factories/mapping-service.factory';
import { MappingService } from './core/services/api/mapping.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: 'backend',
      useValue:'Strapi'
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
      deps: ['backend', ApiService, JwtService],
      useFactory: AuthServiceFactory
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
