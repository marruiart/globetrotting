import { Component } from '@angular/core';
import { BACKEND, environment } from 'src/environments/environment';
import { LocationsApiService } from './core/services/api/data-api/locations-api.service';
import { CharactersApiService } from './core/services/api/data-api/characters-api.service';
import { Subscription, lastValueFrom, map, tap } from 'rxjs';
import { CustomTranslateService } from './core/services/custom-translate.service';
import { AuthFacade } from './core/+state/auth/auth.facade';
import { FirebaseFacade } from './core/+state/firebase/firebase.facade';
import { SubscriptionsService } from './core/services/subscriptions.service';
import { FavoritesFacade } from './core/+state/favorites/favorites.facade';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public language = "es";
  private subs: Subscription[] = [];

  constructor(
    private locationsApiSvc: LocationsApiService,
    private charactersApiSvc: CharactersApiService,
    public translate: CustomTranslateService,
    private authFacade: AuthFacade,
    private firebaseFacade: FirebaseFacade,
    private favsFacade: FavoritesFacade,
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
        sub: this.firebaseFacade.error$.pipe(tap(error => {
          if (error) console.error(error);
        })).subscribe()
      },
      {
        component: 'AppComponent',
        sub: this.favsFacade.error$.pipe(tap(error => {
          if (error) console.error(error);
        })).subscribe()
      }
    ]);
  }

  private fetchExternalData() {
    if (environment.apiUpdate) {
      if (BACKEND == 'Firebase') {
        let sub = this.firebaseFacade.sizes$.pipe(tap(sizes => {
          if (Object.keys(sizes).length != 0) {
            sub.unsubscribe();
            //lastValueFrom(this.charactersApiSvc.getAllFromApi()).catch(err => console.error(err));
            lastValueFrom(this.locationsApiSvc.getAllFromApi()).catch(err => console.error(err));
          }
        })).subscribe();
      } else {
        lastValueFrom(this.charactersApiSvc.getAllFromApi()).catch(err => console.error(err));
        lastValueFrom(this.locationsApiSvc.getAllFromApi()).catch(err => console.error(err));
      }
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

  onDestroy() {
    if (this.subs) {
      this.subs.forEach(sub => sub.unsubscribe());
    }
  }
}
