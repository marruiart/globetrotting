import { Pipe, PipeTransform } from '@angular/core';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { Fav } from 'src/app/core/models/globetrotting/fav.interface';

@Pipe({
  name: 'fav'
})
export class FavPipe implements PipeTransform {

  transform(destinations: Destination[], favorites: Fav[]): Destination[] {
    destinations.map(destination => {
      return destination["fav"] = favorites.reduce((prev, fav) => prev || fav.destination_id == destination.id, false);
    })
    return destinations;
  }

}