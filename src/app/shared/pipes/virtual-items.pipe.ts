import { Pipe, PipeTransform } from '@angular/core';
import { lastValueFrom, tap } from 'rxjs';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';

@Pipe({
  name: 'virtualItems'
})
export class VirtualItemsPipe implements PipeTransform {

  constructor(
    public destinationsSvc: DestinationsService
  ) { }

  async transform(destinations: Destination[]): Promise<(Destination | undefined)[]> {
    let _destinations: (Destination | undefined)[] = [];
    this.destinationsSvc.pagination$.subscribe({
      next: res => {
        _destinations = Array.from({ length: res.pagination.total });
        _destinations.splice(0, destinations.length, ...destinations);
      },
      error: err => {
        console.error(err);
      }
    })
    return _destinations;
  }

}
