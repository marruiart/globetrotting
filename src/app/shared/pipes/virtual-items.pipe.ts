import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

@Pipe({
  name: 'virtualItems'
})
export class VirtualItemsPipe implements PipeTransform, OnDestroy {

  constructor(
    private subsSvc: SubscriptionsService,
    public destinationsSvc: DestinationsService
  ) { }

  async transform(destinations: Destination[]): Promise<(Destination | undefined)[]> {
    let _destinations: (Destination | undefined)[] = [];
    this.subsSvc.addSubscriptions([
      {
        component: 'VirtualItemsPipe',
        sub: this.destinationsSvc.destinationsPage$.subscribe({
          next: res => {
            _destinations = Array.from({ length: res.pagination.total });
            _destinations.splice(0, destinations.length, ...destinations);
          },
          error: err => {
            console.error(err);
          }
        })
      }
    ])
    return _destinations;
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('VirtualItemsPipe');
  }

}
