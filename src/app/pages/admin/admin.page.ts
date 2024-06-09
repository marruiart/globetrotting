import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { LatLng } from '@capacitor/google-maps/dist/typings/definitions';
import { lastValueFrom, tap } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { DestinationsFacade } from 'src/app/core/+state/destinations/destinations.facade';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { MediaService } from 'src/app/core/services/api/media.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { Collection, Collections, timestampToYearMonthDay } from 'src/app/core/utilities/utilities';
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver';
import { ref } from 'firebase/storage';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service';
import { Timestamp } from 'firebase/firestore';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly COMPONENT = 'AdminPage';
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>
  newMap: GoogleMap | undefined

  private markersIds: string[] = [];
  private token: string | null = null;
  private currentUser: User | null = null;
  public csvForm: FormGroup;
  public collection: any = null;
  public collections: (Collection | "all")[] = ["all", Collections.USERS, Collections.DESTINATIONS, Collections.BOOKINGS];

  constructor(
    // Facades
    private destsFacade: DestinationsFacade,
    private authFacade: AuthFacade,
    // Services
    private firebaseSvc: FirebaseService,
    private destinationsSvc: DestinationsService,
    private subsSvc: SubscriptionsService,
    private mediaSvc: MediaService,
    private fb: FormBuilder
  ) {
    this.csvForm = this.fb.group({
      collection: ['']
    });
  }

  ngOnInit() {
    this.collection = this.collections[0];;
  }

  private async initSubscriptions() {
    //await lastValueFrom(this.destinationsSvc.getAllDestinations());

    this.subsSvc.addSubscriptions(this.COMPONENT,
      this.destsFacade.destinations$.subscribe(async destinations => {
        if (destinations.length) {
          await this.removeMarkers();
          const markers = this.generateMarkers(destinations);
          await this.addMarkers(...markers);
        }
      }),
      this.authFacade.currentUser$.subscribe(currentUser => this.currentUser = currentUser),
      this.authFacade.token$.pipe(tap(token => this.token = token)).subscribe()
    );
  }

  async ngAfterViewInit() {
    await this.createMap();
    this.initSubscriptions();
  }

  private async createMap() {
    this.newMap = await GoogleMap.create({
      id: 'globettroting-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.mapsApiKey,
      config: {
        center: {
          lat: 36.740660343024445,
          lng: -4.554452073511114,
        },
        zoom: 2.3,
      },
    });
  }

  private generateMarkers(destinations: Destination[]): Marker[] {
    return destinations.map(dest => {
      const coordinate = (typeof dest.coordinate === 'string') ? JSON.parse(dest.coordinate) as LatLng : dest.coordinate;
      return { coordinate: coordinate, title: dest.name }
    })
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

  /**
 * Downloads a CSV file for the given collection.
 *
 * This method generates a CSV file based on the provided collection and current user's ID.
 * It then retrieves the download URLs for the generated files from Firebase storage and saves them locally.
 *
 * @param collection The collection for which the CSV file is to be generated.
 */
  public downloadCsv(collection: Collection) {
    const body = {
      "user_id": this.currentUser!.user_id,
      "collection": collection
    }
    this.mediaSvc.generateCsv(body, this.token!).pipe(tap({
      next: res => {
        const filesLocation = res.files_location
        filesLocation.forEach((storageUrl: string, index: number) => {
          this.firebaseSvc.getFileDownloadUrl(storageUrl).then(fileUrl => {
            try {
              const date = timestampToYearMonthDay(Timestamp.now())
              const filename = `informe-${collection}${index != 0 ? `-${index}` : ""}-${date}.csv`
              saveAs(fileUrl, "filename")
              console.log("File downloaded successfully!")
            } catch (error) {
              console.error('Error downloading file:', error);
            }
          }).catch(error => {
            console.error('Error obtaining file download url:', error);
          });
        })
      },
      error: err => console.error(err)
    })).subscribe();
  }

  /**
 * Initiates the download of a CSV file when triggered by an event.
 *
 * This method checks if the current user is authenticated and has the necessary role
 * to download a CSV file. If the user meets the criteria, it calls the downloadCsv method.
 *
 * @param event The event that triggers the download.
 */
  public onDownloadCsv(event: Event) {
    if (this.currentUser && this.token && ["ADMIN", "AGENT"].includes(this.currentUser.role)) {
      const collection = this.csvForm.value.collection;
      this.downloadCsv(collection);
    }
  }

  ngOnDestroy(): void {
    this.subsSvc.unsubscribe(this.COMPONENT);
    this.newMap?.destroy();
  }


}
