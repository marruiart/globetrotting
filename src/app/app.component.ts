import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocationsApiService } from './core/services/api/data-api/locations-api.service';
import { CharactersApiService } from './core/services/api/data-api/characters-api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private locationsApiSvc: LocationsApiService,
    private charactersApiSvc: CharactersApiService,
  ) {
    if (environment.apiUpdate) {
      lastValueFrom(this.charactersApiSvc.getAllFromApi()).catch(err => console.error(err));
      lastValueFrom(this.locationsApiSvc.getAllFromApi()).catch(err => console.error(err));
    }
  }
}
