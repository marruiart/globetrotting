import { Component, OnDestroy, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { UserFacade } from 'src/app/core/libs/load-user/load-user.facade';
import { NewBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { ClientFavDestination } from 'src/app/core/models/globetrotting/client.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { FavoritesService } from 'src/app/core/services/api/favorites.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

export interface FavClickedEvent {
  fav: boolean;
}

@Component({
  selector: 'app-destinations',
  templateUrl: './destinations.page.html',
  styleUrls: ['./destinations.page.scss'],
})
export class DestinationsPage implements OnInit, OnDestroy {
  public role: string | null = null;
  public specificUserId: number | null = null;
  private favs: ClientFavDestination[] = [];
  public itemSize = 600;

  constructor(
    public destinationsSvc: DestinationsService,
    private subsSvc: SubscriptionsService,
    public userFacade: UserFacade,
    public favsSvc: FavoritesService,
    public bookingsSvc: BookingsService,
  ) {
    this.subsSvc.addSubscriptions([
      {
        component: 'DestinationsPage',
        sub: this.userFacade.currentUser$.subscribe(res => {
          this.role = res.role;
          if (res.specificUser) {
            this.specificUserId = res.specificUser.id
            if (res.specificUser.type == 'AUTHENTICATED') {
              this.favs = res.specificUser.favorites;
            }
          }
        })
      }])
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

  onFavClicked(destination: Destination, event: FavClickedEvent) {
    if (this.specificUserId) {
      if (event.fav) {
        // Create new fav
        let fav: NewFav = {
          client_id: this.specificUserId,
          destination_id: destination.id
        }
        lastValueFrom(this.favsSvc.addFav(fav)).catch(err => console.error(err));
      } else {
        // Delete fav
        let fav = this.favs.find(f => f.destination_id == destination.id);
        if (fav) {
          lastValueFrom(this.favsSvc.deleteFav(fav.fav_id)).catch(err => console.error(err));;
        }
      }
    }
  }

  onCreateBookingClicked(destination: Destination) {
    if (this.specificUserId) {
      let booking: NewBooking = {
        start: "2023-11-23",
        end: "2023-11-30",
        travelers: 2,
        client_id: this.specificUserId,
        destination_id: destination.id
      }
      lastValueFrom(this.bookingsSvc.addBooking(booking)).catch(err => console.error(err));
    }
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('DestinationsPage');
  }

}
