import { Component, Input, OnDestroy } from '@angular/core';
import { map } from 'rxjs';
import { AuthFacade } from 'src/app/core/libs/auth/auth.facade';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

@Component({
  selector: 'app-destination-card',
  templateUrl: './destination-card.component.html',
  styleUrls: ['./destination-card.component.scss'],
})
export class DestinationCardComponent implements OnDestroy {
  private _destination!: Destination;
  public user: string | null = null;
  public fav: boolean = false;

  @Input() set destination(destination: Destination) {
    this._destination = destination;
  }

  get destination() {
    return this._destination;
  }

  constructor(
    private subsSvc: SubscriptionsService,
    private authFacade: AuthFacade
  ) {
    this.subsSvc.addSubscription('DestinationCardComponent',
      this.authFacade.role$.subscribe(res => this.user = res)
    )
  }

  public updateFav() {
    this.fav = !this.fav;
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('DestinationCardComponent');
  }

}
