import { Pipe, PipeTransform } from '@angular/core';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { ClientFavDestination } from 'src/app/core/models/globetrotting/fav.interface';
import { AdminAgentOrClientUser } from 'src/app/core/models/globetrotting/user.interface';

@Pipe({
  name: 'fav'
})
export class FavPipe implements PipeTransform {

  transform(destinations: Destination[], client: AdminAgentOrClientUser | null): Destination[] {
    if (client?.role == 'AUTHENTICATED') {
      destinations = destinations.map(destination => {
        let fav = client.favorites.reduce((prev: any, fav: ClientFavDestination) => prev || fav.destination_id == destination.id, false) ?? false;
        return { ...destination, ...{ fav: fav } }
      })
    }
    return destinations;
  }

}