import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { DestinationsFacade } from 'src/app/core/+state/destinations/destinations.facade';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements AfterViewInit, OnDestroy {
  private readonly COMPONENT = 'AdminPage';
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>
  newMap: GoogleMap | undefined

  private markersIds: string[] = [];

  constructor(
    private destsFacade: DestinationsFacade,
    private subsSvc: SubscriptionsService
  ) {
    this.init();
  }

  private async init() {
    this.subsSvc.addSubscriptions(this.COMPONENT,
      this.destsFacade.destinations$.subscribe(async destinations => {
        if (destinations.length) {
          await this.removeMarkers();
          const markers = this.generateMarkers(destinations);
          await this.addMarkers(...markers);
        }
      })
    );
  }

  async ngAfterViewInit() {
    await this.createMap();
  }

  private async createMap() {
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

  private generateMarkers(destinations: Destination[]): Marker[] {
    return destinations.map(dest => ({ coordinate: dest.coordinate, title: dest.name }))
  }

  private async addMarkers(...markers: Marker[]) {
    if (this.newMap) {
      this.markersIds = await this.newMap.addMarkers(markers);
    }
  }

  private async removeMarkers() {
    if (this.newMap && this.markersIds.length) {
      await this.newMap.removeMarkers(this.markersIds);
    }
  }


  ngOnDestroy(): void {
    this.subsSvc.unsubscribe(this.COMPONENT);
    this.newMap?.destroy();
  }


}
