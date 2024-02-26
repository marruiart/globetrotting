import { Component, OnDestroy, OnInit } from '@angular/core';
import { VirtualScrollerLazyLoadEvent } from 'primeng/virtualscroller';
import { lastValueFrom, map, of, switchMap } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { DestinationsFacade } from 'src/app/core/+state/destinations/destinations.facade';
import { FavoritesFacade } from 'src/app/core/+state/favorites/favorites.facade';
import { BookingForm, NewBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { ClientFavDestination, NewFav } from 'src/app/core/models/globetrotting/fav.interface';
import { AdminAgentOrClientUser } from 'src/app/core/models/globetrotting/user.interface';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { FavoritesService } from 'src/app/core/services/api/favorites.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { getClientName } from 'src/app/core/utilities/utilities';

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
  public currentUser: AdminAgentOrClientUser | null = null;
  private _clientFavs: ClientFavDestination[] = [];
  public itemSize = 600;
  public showDialog: boolean = false;

  constructor(
    public destinationsSvc: DestinationsService,
    private subsSvc: SubscriptionsService,
    public authFacade: AuthFacade,
    public favsFacade: FavoritesFacade,
    public destinationsFacade: DestinationsFacade,
    public favsSvc: FavoritesService,
    public bookingsSvc: BookingsService
  ) {
    this.startSubscriptions();
  }

  ngOnInit() {
    lastValueFrom(this.destinationsSvc.getAllDestinations()).catch(err => {
      console.error(err);
    });
  }

  private startSubscriptions() {
    this.subsSvc.addSubscription({
      component: 'DestinationsPage',
      sub: this.authFacade.currentUser$.pipe(switchMap(user => {
        if (user) {
          this.currentUser = user ?? null
          if (user.role == 'AUTHENTICATED') {
            return this.favsFacade.clientFavs$.pipe(map(favs => this._clientFavs = favs));
          }
        }
        return of()
      })).subscribe()
    })
  }

  public loadDestinations(event?: VirtualScrollerLazyLoadEvent) {
    if (event && event.first !== undefined && event.rows !== undefined && event.rows != 0 && event.last !== undefined) {
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
    if (this.currentUser?.specific_id) {
      if (event.fav) {
        // Create new fav
        let fav: NewFav = {
          client_id: this.currentUser.specific_id,
          destination_id: destination.id
        }
        this.favsFacade.addFav(fav);
        //lastValueFrom(this.favsSvc.addFav(fav)).catch(err => console.error(err));
      } else {
        // Delete fav
        let fav = this._clientFavs.find(f => f.destination_id == destination.id);
        if (fav) {
          this.favsFacade.deleteFav(fav.fav_id);
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

  public onBookingAccepted(booking: BookingForm) {
    if (this.currentUser?.specific_id && this._selectedDestination) {
      let _booking: NewBooking = {
        clientName: getClientName(this.currentUser),
        client_id: this.currentUser.specific_id,
        destination_id: this._selectedDestination.id,
        destinationName: this._selectedDestination.name,
        end: booking.end,
        isActive: true,
        isConfirmed: false,
        start: booking.start,
        travelers: booking.travelers,
      }
      lastValueFrom(this.bookingsSvc.addBooking(_booking)).catch(err => console.error(err));
    }
    this.hideDialog();
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('DestinationsPage');
  }
}
