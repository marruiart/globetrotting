import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocationsApiService } from './core/services/api/data-api/locations-api.service';
import { CharactersApiService } from './core/services/api/data-api/characters-api.service';
import { lastValueFrom } from 'rxjs';
import { CustomTranslateService } from './core/services/custom-translate.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public language = "es";

  constructor(
    private locationsApiSvc: LocationsApiService,
    private charactersApiSvc: CharactersApiService,
    public translate: CustomTranslateService
  ) {
    this.init();
  }

  private async init() {
    if (environment.apiUpdate) {
      lastValueFrom(this.charactersApiSvc.getAllFromApi()).catch(err => console.error(err));
      lastValueFrom(this.locationsApiSvc.getAllFromApi()).catch(err => console.error(err));
    }
    this.translate.changeLanguage('es');
  }

  public onTranslate() {
    if (this.language == 'es') {
      this.language = 'en';
    } else {
      this.language = 'es';
    }
    lastValueFrom(this.translate.changeLanguage(this.language));
  }
}
