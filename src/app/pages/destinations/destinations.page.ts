import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ScrollerOptions } from 'primeng/api';
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
import { Roles, getUserName } from 'src/app/core/utilities/utilities';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';


export interface FavClickedEvent {
  fav: boolean;
}

@Component({
  selector: 'app-destinations',
  templateUrl: './destinations.page.html',
  styleUrls: ['./destinations.page.scss'],
})
export class DestinationsPage implements OnInit, OnDestroy {
  private readonly COMPONENT = 'DestinationsPage';
  private renderer: Renderer2;

  public selectedDestination: Destination | null = null;
  public currentUser: AdminAgentOrClientUser | null = null;
  private _clientFavs: ClientFavDestination[] = [];
  public itemSize = 300;
  public scrollHeight = 1500
  public showDialog: boolean = false;
  public scrollerOptions: ScrollerOptions = { showLoader: true, columns: [5], step: 10 }
  Roles: any;

  constructor(
    public destinationsSvc: DestinationsService,
    private subsSvc: SubscriptionsService,
    public authFacade: AuthFacade,
    public favsFacade: FavoritesFacade,
    public destinationsFacade: DestinationsFacade,
    public favsSvc: FavoritesService,
    public bookingsSvc: BookingsService,
    private rendererFactory: RendererFactory2,
    private el: ElementRef
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.scrollHeight = (window.innerHeight - 20);
    let columns = window.innerWidth / 330
    console.log(`columns: ${columns}`)
    this.itemSize = (600 / (columns));
    this.setHeightForVirtualScrollerItems('570px');
    window.addEventListener('resize', this.updateScrollHeight);
    this.startSubscriptions();
  }

  private updateScrollHeight = () => {
    this.scrollHeight = (window.innerHeight - 20);
  }

  setHeightForVirtualScrollerItems(newHeight: string): void {
    const items = this.el.nativeElement.querySelectorAll('.p-virtualscroller-item');
    items.forEach((item: HTMLElement) => {
      this.renderer.setStyle(item, 'height', newHeight);
    });
  }

  async ngOnInit() {
    await lastValueFrom(this.destinationsSvc.getAllDestinations()).catch(err => console.error(err));
    //await lastValueFrom(this.favsSvc.getAllClientFavs()).catch(err => console.error(err));
  }

  private startSubscriptions() {
    this.subsSvc.addSubscriptions(this.COMPONENT,
      this.authFacade.currentUser$.pipe(switchMap(user => {
        this.currentUser = user;
        if (user?.role === Roles.AUTHENTICATED) {
          return this.favsFacade.clientFavs$.pipe(map(favs => this._clientFavs = favs ?? []));
        }
        return of()
      })).subscribe()
    )
  }

  public loadDestinations(event?: VirtualScrollerLazyLoadEvent) {
    if (event && event.first !== undefined && event.rows !== undefined && event.rows != 0 && event.last !== undefined) {
      const visibleEnd = event.last >= this.destinationsSvc.itemsCount;
      if (visibleEnd) {
        this.loadNextPage();
      }
      this.setHeightForVirtualScrollerItems('570px');
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
    this.selectedDestination = destination;
    this.showDialog = true;
  }

  private hideDialog() {
    this.selectedDestination = null;
    this.showDialog = false;
  }

  public onBookingAccepted(booking: BookingForm) {
    if (this.currentUser?.specific_id && this.selectedDestination) {
      let _booking: NewBooking = {
        clientName: getUserName(this.currentUser),
        client_id: this.currentUser.specific_id,
        destination_id: this.selectedDestination.id,
        destinationName: this.selectedDestination.name,
        end: booking.end,
        isActive: true,
        isConfirmed: false,
        start: booking.start,
        travelers: booking.travelers
      }
      lastValueFrom(this.bookingsSvc.addBooking(_booking)).catch(err => console.error(err));
    }
    this.hideDialog();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateScrollHeight);
    this.subsSvc.unsubscribe(this.COMPONENT);
  }
}
