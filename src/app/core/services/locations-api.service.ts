import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, map, Observable, onErrorResumeNext, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocationPage } from '../models/LocationPage';
import { Location } from '../models/Location';
import { HttpProvider } from './http/http.provider';
import { DestinationsService } from './destinations.service';
import { Destination, NewDestination } from '../models/destination.interface';


@Injectable({
  providedIn: 'root'
})
export class LocationsApiService {
  private _locations: BehaviorSubject<Location[]> = new BehaviorSubject<Location[]>([]);
  public locations$: Observable<Location[]> = this._locations.asObservable();

  constructor(
    private http: HttpProvider,
    private destinationsSvc: DestinationsService
  ) { }

  public getAllFromApi(allPages: LocationPage[] = [], url: string = `${environment.API_URL}/location`): Observable<LocationPage[]> {
    return this.http.get<LocationPage>(url).pipe(map(res => {
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

  private addLocationsToLocalDb(allPages: LocationPage[]) {
    let sources: Location[] = [];
    for (let page of allPages) {
      for (let location of page.results) {
        sources.push(location);
      }
    }
    this.addOneLocation(sources);
  }

  private addOneLocation(sources: Location[]) {
    if (sources && sources.length > 0) {
      let loc: Location | undefined = sources.pop();
      if (loc) {
        this.addLocation(loc, false).subscribe({
          next: _ => {
            this.addOneLocation(sources);
          },
          error: _ => {
            if (loc != undefined)
              this.updateLocation(loc, false).pipe(finalize(() => {
                this.addOneLocation(sources);
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