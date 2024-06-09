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
import { ClientsFacade } from './core/+state/clients/clients.facade';
import { AgentsFacade } from './core/+state/agents/agents.facade';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private readonly COMPONENT = 'AppComponent';
  public language = "es";
  private subs: Subscription[] = [];

  constructor(
    // Services
    private charactersApiSvc: CharactersApiService,
    private locationsApiSvc: LocationsApiService,
    private subsSvc: SubscriptionsService,
    public translate: CustomTranslateService,
    // Facades
    private agentsFacade: AgentsFacade,
    private authFacade: AuthFacade,
    private bookingsFacade: BookingsFacade,
    private clientsFacade: ClientsFacade,
    private destinationsFacade: DestinationsFacade,
    private favsFacade: FavoritesFacade,
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
    this.subsSvc.addSubscriptions(this.COMPONENT,
      this.agentsFacade.error$.pipe(tap(error => { if (error) console.error(error) })).subscribe(),
      this.authFacade.error$.pipe(tap(error => { if (error) console.error(error) })).subscribe(),
      this.bookingsFacade.error$.pipe(tap(error => { if (error) console.error(error) })).subscribe(),
      this.clientsFacade.error$.pipe(tap(error => { if (error) console.error(error) })).subscribe(),
      this.destinationsFacade.error$.pipe(tap(error => { if (error) console.error(error) })).subscribe(),
      this.favsFacade.error$.pipe(tap(error => { if (error) console.error(error) })).subscribe()
    );
  }

  private fetchExternalData() {
    if (environment.apiUpdate) {
      //lastValueFrom(this.charactersApiSvc.getAllFromApi()).catch(err => console.error(err));
      lastValueFrom(this.locationsApiSvc.getAllFromApi()).catch(err => console.error(err));
    }
  }

  /**
 * Toggles the language between 'es' (Spanish) and 'en' (English).
 * Updates the language using the translation service.
 *
 * @returns void
 */
  public onTranslate() {
    if (this.language == 'es') {
      this.language = 'en';
    } else {
      this.language = 'es';
    }
    lastValueFrom(this.translate.changeLanguage(this.language));
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe(this.COMPONENT);
  }
}
