import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocationsApiService } from './core/services/locations-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private locationsApiSvc: LocationsApiService
  ) {
    if (environment.apiUpdate) {
      this.locationsApiSvc.getAllFromApi().subscribe({
        error: err => {
          console.error(err);
        }
      });
    }
  }

}
