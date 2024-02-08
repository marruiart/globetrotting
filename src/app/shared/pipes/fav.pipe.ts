import { Pipe, PipeTransform } from '@angular/core';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { ClientFavDestination } from 'src/app/core/models/globetrotting/fav.interface';
import { User } from 'src/app/core/models/globetrotting/user.interface';

@Pipe({
  name: 'fav'
})
export class FavPipe implements PipeTransform {

  transform(destinations: Destination[], client: User | null): Destination[] {
    if (client?.role == 'AUTHENTICATED') {
      destinations.map(destination => {
        return destination['fav'] = client.favorites.reduce((prev: any, fav: ClientFavDestination) => prev || fav.destination_id == destination.id, false) ?? false;
      })
    }
    return destinations;
  }

}