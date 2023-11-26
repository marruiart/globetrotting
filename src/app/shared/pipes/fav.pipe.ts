import { Pipe, PipeTransform } from '@angular/core';
import { Agent } from 'src/app/core/models/globetrotting/agent.interface';
import { Client } from 'src/app/core/models/globetrotting/client.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';

@Pipe({
  name: 'fav'
})
export class FavPipe implements PipeTransform {

  transform(destinations: Destination[], client: Client | Agent | null): Destination[] {
    if (client?.type == 'AUTHENTICATED') {
      destinations.map(destination => {
        return destination["fav"] = client.favorites.reduce((prev, fav) => prev || fav.destination_id == destination.id, false) ?? false;
      })
    }
    return destinations;
  }

}