import { Component, OnDestroy, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Subscription, lastValueFrom } from 'rxjs';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';

@Component({
  selector: 'app-destinations',
  templateUrl: './destinations.page.html',
  styleUrls: ['./destinations.page.scss'],
})
export class DestinationsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public itemSize = 600;

  constructor(
    public destinationsSvc: DestinationsService
  ) { }

  ngOnInit() {
    lastValueFrom(this.destinationsSvc.getAllDestinations()).catch(err => {
      console.error(err);
    });
  }

  loadDestinations(event?: LazyLoadEvent) {
    if (event && event.first != undefined && event.rows != undefined && event.rows != 0 && event.last != undefined) {
      const visibleEnd = event.last >= this.destinationsSvc.itemsCount;
      if (visibleEnd) {
        this.loadNextPage();
      }
    }
  }

  loadNextPage() {
    lastValueFrom(this.destinationsSvc.getNextDestinationsPage()).catch(err => {
      console.error(err);
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

}
