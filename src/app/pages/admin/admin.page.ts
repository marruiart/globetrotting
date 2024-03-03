import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements AfterViewInit {

  @ViewChild('map') mapRef!: ElementRef<HTMLElement>
  newMap: GoogleMap | undefined

  constructor() { }

  ngAfterViewInit(): void {
    this.createMap();
  }

  async createMap() {
    this.newMap = await GoogleMap.create({
      id: 'my-cool-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.mapsApiKey,
      config: {
        center: {
          lat: 36.740660343024445,
          lng: -4.554452073511114,
        },
        zoom: 8,
      },
    });
  }

}
