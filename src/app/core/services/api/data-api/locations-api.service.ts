import { Injectable } from '@angular/core';
import { finalize, map, Observable } from 'rxjs';
import { BACKEND, environment } from 'src/environments/environment';
import { Location } from '../../../models/rick-morty-api/location.interface';
import { HttpService } from '../../http/http.service';
import { DestinationsService } from '../destinations.service';
import { Destination, NewDestination } from '../../../models/globetrotting/destination.interface';
import { Page } from 'src/app/core/models/rick-morty-api/pagination.interface';
import { LatLng } from '@capacitor/google-maps/dist/typings/definitions';
import * as turf from "@turf/turf";
import { Backends } from 'src/app/core/utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class LocationsApiService {

  constructor(
    private http: HttpService,
    private destinationsSvc: DestinationsService
  ) { }

  public getAllFromApi(
    allPages: Page<Location>[] = [],
    url: string = `${environment.apiUrl}/location`)
    : Observable<Page<Location>[]> {

    return this.http.get<Page<Location>>(url).pipe(map(res => {
      if (res.info.next) {
        this.getAllFromApi(allPages, res.info.next).subscribe();
      }
      allPages.push(res);
      if (allPages.length == res.info.pages) {
        this.addLocationsToLocalDb(allPages);
      }
      return allPages;
    }));
  }

  private addLocationsToLocalDb(allPages: Page<Location>[]) {
    let sources: Location[] = [];
    for (let page of allPages) {
      for (let location of page.results) {
        sources.push(location);
      }
    }
    this.addAsDestinationToDb(sources);
  }

  private addAsDestinationToDb(sources: Location[]) {
    if (sources && sources.length > 0) {
      let loc: Location | undefined = sources.pop();
      if (loc) {
        this.addLocation(loc, false).subscribe({
          next: _ => {
            this.addAsDestinationToDb(sources);
          },
          error: _ => {
            if (loc != undefined)
              this.updateLocation(loc, false).pipe(finalize(() => {
                this.addAsDestinationToDb(sources);
                console.log("Finalized");
              })).subscribe({
                error: err => {
                  console.error(err);
                }
              });
          }
        });
      }
    }
  }

  private generateRandomNumber(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
  }

  private generateCoordinate(): LatLng {
    const oceanPolygons = [
      turf.bboxPolygon([-176, -180, -80, 6]),
      turf.bboxPolygon([-137, 23, -180, 55]),
      turf.bboxPolygon([145, 23, 180, 55]),
      turf.bboxPolygon([-55, -80, 180, -45]),
      turf.bboxPolygon([-55, -35, 130, -52]),
      turf.bboxPolygon([-33, -80, 8, 2]),
      turf.bboxPolygon([-61, -80, 8, -41]),
      turf.bboxPolygon([-44, -80, 8, -24]),
      turf.bboxPolygon([53, -80, 95, 4]),
      turf.bboxPolygon([53, -80, 112, -10]),
      turf.bboxPolygon([-52, 30, -12, 58]),
      turf.bboxPolygon([-69, 22, -18, 42]),
      turf.bboxPolygon([116, 74, 180, 90]),
      turf.bboxPolygon([-128, 71, -180, 90]),
      turf.bboxPolygon([-22, 66, 12, 80]),
      turf.bboxPolygon([27, 71, 55, 80])
    ];
    let randomCoordinate;
    do {
      const lat = this.generateRandomNumber(-50, 80);
      const lng = this.generateRandomNumber(-180, 180);
      const mark = turf.point([lng, lat]);
      const isOcean = oceanPolygons.some(polygon => turf.booleanWithin(mark, polygon));
      if (!isOcean) {
        randomCoordinate = { lat: lat, lng };
      }
    } while (!randomCoordinate);
    return randomCoordinate;
  }

  private generatePrice(): number {
    return this.generateRandomNumber(40, 600);
  }

  private mapNewLocation(location: Location): NewDestination {
    let coordinate: string | LatLng = this.generateCoordinate();
    let newDest: NewDestination = {
      name: location.name,
      type: location.type,
      keywords: location.keywords,
      coordinate: coordinate,
      image: undefined,
      price: this.generatePrice()
    }
    if (BACKEND === Backends.STRAPI) {
      return {
        ...newDest,
        lat: coordinate.lat,
        lng: coordinate.lng
      } as NewDestination
    } else {
      return newDest;
    }
  }

  private mapLocation(location: Location): Destination {
    return {
      ...this.mapNewLocation(location),
      id: location.id
    } as Destination
  }

  public addLocation(location: Location, updateLocationObs: boolean): Observable<NewDestination> {
    return this.destinationsSvc.addDestination(this.mapNewLocation(location), updateLocationObs);
  }

  public updateLocation(location: Location, updateLocationObs: boolean): Observable<NewDestination> {
    return this.destinationsSvc.updateDestination(this.mapLocation(location), updateLocationObs);
  }

}