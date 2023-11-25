import { Pipe, PipeTransform } from '@angular/core';
import { Client } from 'src/app/core/models/globetrotting/client.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';

@Pipe({
  name: 'fav'
})
export class FavPipe implements PipeTransform {

  transform(destinations: Destination[], client: Client | null): Destination[] {
    if (client) {
      destinations.map(destination => {
        return destination["fav"] = client.favorites?.reduce((prev, fav) => prev || fav.id == destination.id, false) ?? false;
      })
    }
    return destinations;
  }

}