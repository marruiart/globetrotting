import { Component, OnDestroy, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { ClientService } from 'src/app/core/services/api/client.service';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

@Component({
  selector: 'app-destinations',
  templateUrl: './destinations.page.html',
  styleUrls: ['./destinations.page.scss'],
})
export class DestinationsPage implements OnInit, OnDestroy {
  public role: string | null = null;
  public user_id: number | null = null;
  public itemSize = 600;

  constructor(
    public destinationsSvc: DestinationsService,
    private subsSvc: SubscriptionsService,
    public authFacade: AuthFacade,
    public clientSvc: ClientService
  ) {
    this.subsSvc.addSubscriptions([
      {
        component: 'DestinationsPage',
        sub: this.authFacade.currentUser$.subscribe(res => {
          this.role = res.role;
          this.user_id = res.user_id
        })
      }
    ]
    )
  }

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
    this.subsSvc.unsubscribe('DestinationsPage');
  }

}
