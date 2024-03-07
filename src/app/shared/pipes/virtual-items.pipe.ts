import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DestinationsFacade } from 'src/app/core/+state/destinations/destinations.facade';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

@Pipe({
  name: 'virtualItems'
})
export class VirtualItemsPipe implements PipeTransform, OnDestroy {

  constructor(
    private subsSvc: SubscriptionsService,
    public destinationsFacade: DestinationsFacade
  ) { }

  async transform(destinations: Destination[]): Promise<(Destination | undefined)[]> {
    let _destinations: (Destination | undefined)[] = [];
    this.subsSvc.addSubscriptions('VirtualItemsPipe',
      this.destinationsFacade.destinationsPage$.subscribe({
        next: res => {
          if (res.pagination.total) {
            _destinations = Array.from({ length: res.pagination.total });
            _destinations.splice(0, destinations.length, ...destinations);
          }
        }, error: err => console.error(err)
      })
    )
    return _destinations;
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('VirtualItemsPipe');
  }

}
