import { Component, OnDestroy } from '@angular/core';
import { BACKEND, environment } from 'src/environments/environment';
import { LocationsApiService } from './core/services/api/data-api/locations-api.service';
import { CharactersApiService } from './core/services/api/data-api/characters-api.service';
import { Subscription, lastValueFrom, tap } from 'rxjs';
import { CustomTranslateService } from './core/services/custom-translate.service';
import { AuthFacade } from './core/+state/auth/auth.facade';
import { SubscriptionsService } from './core/services/subscriptions.service';
import { FavoritesFacade } from './core/+state/favorites/favorites.facade';
import { DestinationsFacade } from './core/+state/destinations/destinations.facade';
import { BookingsFacade } from './core/+state/bookings/bookings.facade';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  public language = "es";
  private subs: Subscription[] = [];

  constructor(
    private locationsApiSvc: LocationsApiService,
    private charactersApiSvc: CharactersApiService,
    public translate: CustomTranslateService,
    private authFacade: AuthFacade,
    private bookingsFacade: BookingsFacade,
    private favsFacade: FavoritesFacade,
    private destinationsFacade: DestinationsFacade,
    private subsSvc: SubscriptionsService
  ) {
    console.info(BACKEND);
    this.init();
  }

  private async init() {
    this.fetchExternalData();
    this.translate.changeLanguage('es');
    this.startSubscriptions();
  }

  private startSubscriptions() {
    this.subsSvc.addSubscriptions([
      {
        component: 'AppComponent',
        sub: this.authFacade.error$.pipe(tap(error => {
          if (error) console.error(error);
        })).subscribe()
      },
      {
        component: 'AppComponent',
        sub: this.favsFacade.error$.pipe(tap(error => {
          if (error) console.error(error);
        })).subscribe()
      },
      {
        component: 'AppComponent',
        sub: this.destinationsFacade.error$.pipe(tap(error => {
          if (error) console.error(error);
        })).subscribe()
      },
      {
        component: 'AppComponent',
        sub: this.bookingsFacade.error$.pipe(tap(error => {
          if (error) console.error(error);
        })).subscribe()
      }
    ]);
  }

  private fetchExternalData() {
    if (environment.apiUpdate) {
      lastValueFrom(this.charactersApiSvc.getAllFromApi()).catch(err => console.error(err));
      lastValueFrom(this.locationsApiSvc.getAllFromApi()).catch(err => console.error(err));
    }
  }

  public onTranslate() {
    if (this.language == 'es') {
      this.language = 'en';
    } else {
      this.language = 'es';
    }
    lastValueFrom(this.translate.changeLanguage(this.language));
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.forEach(sub => sub.unsubscribe());
    }
  }
}
