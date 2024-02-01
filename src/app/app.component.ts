import { Component } from '@angular/core';
import { BACKEND, environment } from 'src/environments/environment';
import { LocationsApiService } from './core/services/api/data-api/locations-api.service';
import { CharactersApiService } from './core/services/api/data-api/characters-api.service';
import { Subscription, lastValueFrom, map } from 'rxjs';
import { CustomTranslateService } from './core/services/custom-translate.service';
import { AuthFacade } from './core/+state/auth/auth.facade';

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
    private authFacade: AuthFacade
  ) {
    this.init();
    console.info(BACKEND);
  }

  private async init() {
    if (environment.apiUpdate) {
      lastValueFrom(this.charactersApiSvc.getAllFromApi()).catch(err => console.error(err));
      lastValueFrom(this.locationsApiSvc.getAllFromApi()).catch(err => console.error(err));
    }
    this.translate.changeLanguage('es');
    this.subs.push(this.authFacade.error$.pipe(map(error => {
      if (error) console.error(error);
    })).subscribe());
    this.subs.push(this.authFacade.error$.pipe(map(error => {
      if (error) console.error(error);
    })).subscribe());
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
