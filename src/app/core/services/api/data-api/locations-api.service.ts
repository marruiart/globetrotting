import { Injectable } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Location } from '../../../models/rick-morty-api/location.interface';
import { HttpService } from '../../http/http.service';
import { DestinationsService } from '../destinations.service';
import { Destination, NewDestination } from '../../../models/globetrotting/destination.interface';
import { Page } from 'src/app/core/models/rick-morty-api/pagination';


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
    url: string = `${environment.API_URL}/location`)
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

  private mapNewLocation(location: Location): NewDestination {
    return {
      name: location.name,
      type: location.type,
      dimension: location.dimension,
      image: undefined,
    }
  }

  private mapLocation(location: Location): Destination {
    return {
      id: location.id,
      name: location.name,
      type: location.type,
      dimension: location.dimension,
      image: undefined,
    }
  }

  public addLocation(location: Location, updateLocationObs: boolean): Observable<NewDestination> {
    return this.destinationsSvc.addDestination(this.mapNewLocation(location), updateLocationObs).pipe(tap(_ => {

    }))
  }

  public updateLocation(location: Location, updateLocationObs: boolean): Observable<NewDestination> {
    return this.destinationsSvc.updateDestination(this.mapLocation(location), updateLocationObs);
  }

}