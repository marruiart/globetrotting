import { Component, OnInit } from '@angular/core';
import { DestinationsService } from 'src/app/core/services/destinations.service';
import { LocationsApiService } from 'src/app/core/services/locations-api.service';

@Component({
  selector: 'app-destinations',
  templateUrl: './destinations.page.html',
  styleUrls: ['./destinations.page.scss'],
})
export class DestinationsPage implements OnInit {

  constructor(
    public destinationsSvc: DestinationsService
  ) { }

  ngOnInit() {
    this.destinationsSvc.getAllDestinations().subscribe({
      error: err => {
        console.error(err);
      }
    });
  }

}
