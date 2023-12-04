import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { UserFacade } from 'src/app/core/libs/load-user/load-user.facade';
import { BookingForm, NewBooking } from 'src/app/core/models/globetrotting/booking.interface';
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
  private _selectedDestination: Destination | null = null;
  public role: string | null = null;
  public specificUserId: number | null = null;
  private favs: ClientFavDestination[] = [];
  public itemSize = 600;
  public showDialog: boolean = false;

  constructor(
    public destinationsSvc: DestinationsService,
    private subsSvc: SubscriptionsService,
    public userFacade: UserFacade,
    public favsSvc: FavoritesService,
    public bookingsSvc: BookingsService,
    private datePipe: DatePipe
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

  public loadDestinations(event?: LazyLoadEvent) {
    if (event && event.first != undefined && event.rows != undefined && event.rows != 0 && event.last != undefined) {
      const visibleEnd = event.last >= this.destinationsSvc.itemsCount;
      if (visibleEnd) {
        this.loadNextPage();
      }
    }
  }

  private loadNextPage() {
    lastValueFrom(this.destinationsSvc.getNextDestinationsPage()).catch(err => {
      console.error(err);
    });
  }

  public onFavClicked(destination: Destination, event: FavClickedEvent) {
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

  public showBookingForm(destination: Destination) {
    this._selectedDestination = destination;
    this.showDialog = true;
  }

  private hideDialog() {
    this._selectedDestination = null;
    this.showDialog = false;
  }

  public saveDestination() {
    console.log("guardar destination");
  }

  public onBookingAccepted(booking: BookingForm) {
    console.log(JSON.stringify(this._selectedDestination));
    console.log(JSON.stringify(booking));
    if (this.specificUserId && this._selectedDestination) {
      let _booking: NewBooking = {
        start: this.datePipe.transform(booking.start, 'yyyy-MM-dd'),
        end: this.datePipe.transform(booking.end, 'yyyy-MM-dd'),
        travelers: booking.travelers,
        client_id: this.specificUserId,
        destination_id: this._selectedDestination.id
      }
      lastValueFrom(this.bookingsSvc.addBooking(_booking)).catch(err => console.error(err));
    }
    this.hideDialog();
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('DestinationsPage');
  }

}
