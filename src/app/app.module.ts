import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiService } from './core/services/api/api.service';
import { httpServiceFactory } from './core/factories/http-service.factory';
import { JwtService } from './core/services/auth/jwt.service';
import { AuthServiceFactory } from './core/factories/auth-service.factory';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MapService } from './core/services/api/map.service';
import { HttpService } from './core/services/http/http.service';
import { AuthService } from './core/services/auth/auth.service';
import { MapServiceFactory } from './core/factories/map-service.factory';

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
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    {
      provide: MapService,
      deps: [],
      useFactory: MapServiceFactory
    },
    {
      provide: HttpService,
      deps: [HttpClient],
      useFactory: httpServiceFactory
    },
    {
      provide: AuthService,
      deps: [ApiService, JwtService],
      useFactory: AuthServiceFactory
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
