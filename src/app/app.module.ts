import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiService } from './core/services/api.service';
import { httpProviderFactory } from './core/factories/http-provider.factory';
import { AuthProvider } from './core/services/auth/auth.provider';
import { JwtService } from './core/services/auth/jwt.service';
import { AuthProviderFactory } from './core/factories/auth-provider.factory';
import { HttpProvider } from './core/services/http/http.provider';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
      provide: HttpProvider,
      deps: [HttpClient],
      useFactory: httpProviderFactory
    },
    {
      provide: AuthProvider,
      deps: [ApiService, JwtService],
      useFactory: AuthProviderFactory
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
