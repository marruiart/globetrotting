import { DatePipe } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { catchError, lastValueFrom, of, switchMap, tap, zip } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { BookingsFacade } from 'src/app/core/+state/bookings/bookings.facade';
import { ClientsFacade } from 'src/app/core/+state/clients/clients.facade';
import { DestinationsFacade } from 'src/app/core/+state/destinations/destinations.facade';
import { NewBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { AdminAgentOrClientUser, User } from 'src/app/core/models/globetrotting/user.interface';
import { StrapiPayload } from 'src/app/core/models/strapi-interfaces/strapi-data.interface';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { UsersService } from 'src/app/core/services/api/users.service';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  public destinations: Destination[] = [];
  public currentUser: AdminAgentOrClientUser | null = null;
  public clients: User[] | null = null;
  public cols: any[] = [];
  public loading: boolean = true;
  public showForm: boolean = false;
  public isResponsive: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isResponsive = window.innerWidth < 960;
  }

  constructor(
    public bookingsFacade: BookingsFacade,
    public usersSvc: UsersService,
    private bookingsSvc: BookingsService,
    private destinationsFacade: DestinationsFacade,
    private clientsFacade: ClientsFacade,
    private authFacade: AuthFacade,
    private subsSvc: SubscriptionsService,
    private translate: CustomTranslateService,
    private datePipe: DatePipe
  ) {
    this.isResponsive = window.innerWidth < 960;
    this.subsSvc.addSubscriptions([
      {
        component: 'BookingsPage',
        sub: this.authFacade.currentUser$.subscribe(currentUser => {
          this.currentUser = currentUser;
        })
      },
      {
        component: 'BookingsPage',
        sub: this.translate.language$.pipe(
          switchMap((_: string) => this.getCols()),
          catchError(err => of(err)))
          .subscribe()
      },
      {
        component: 'BookingsPage',
        sub: this.destinationsFacade.destinations$
          .subscribe((destinations) => {
            this.destinations = destinations;
          })
      },
      {
        component: 'BookingsPage',
        sub: this.bookingsFacade.bookingTable$
          .subscribe((table) => {
            if (table) {
              this.loading = false;
            }
          })
      }
    ])
  }

  async ngOnInit() {
    await lastValueFrom(this.bookingsSvc.getAllBookings()).catch(err => console.error(err));
  }

  private getCols() {
    const bookingId$ = this.translate.getTranslation("bookingsPage.tableBookingId");
    const dates$ = this.translate.getTranslation("bookingsPage.tableDates");
    const travelers$ = this.translate.getTranslation("bookingsPage.tableTravelers");
    const confirmationState$ = this.translate.getTranslation("bookingsPage.tableConfirmationState");
    const agent$ = this.translate.getTranslation("bookingsPage.tableAgent");
    const client$ = this.translate.getTranslation("bookingsPage.tableClient");

    const tableHeaders$ = zip(bookingId$, dates$, travelers$, confirmationState$, agent$, client$).pipe(
      tap(([
        bookingId,
        dates,
        travelers,
        confirmationState,
        agent,
        client
      ]) => {
        this.cols = this.translateMenuItems(bookingId, dates, travelers, confirmationState, agent, client);
      }), catchError(err => of(err)));

    return tableHeaders$;
  }

  private translateMenuItems(bookingId: string, dates: string, travelers: string, confirmationState: string, agent: string, client: string) {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return [
          { field: 'booking_id', header: bookingId },
          { field: 'clientName', header: client },
          { field: 'agentName', header: agent },
          { field: 'dates', header: dates },
          { field: 'travelers', header: travelers },
          { field: 'isConfirmed', header: confirmationState }
        ]
      case 'AGENT':
        return [
          { field: 'booking_id', header: bookingId },
          { field: 'clientName', header: client },
          { field: 'dates', header: dates },
          { field: 'travelers', header: travelers },
          { field: 'isConfirmed', header: confirmationState }
        ]
      case 'AUTHENTICATED':
        return [
          { field: 'dates', header: dates },
          { field: 'travelers', header: travelers },
          { field: 'isConfirmed', header: confirmationState },
          { field: 'agentName', header: agent }
        ]
      default:
        return [];
    }
  }

  public confirmBook(id: number) {
    let modifiedBooking: StrapiPayload<any> = {
      data: {
        id: id,
        isConfirmed: true,
        agent_id: this.currentUser?.specific_id
      }
    }
    lastValueFrom(this.bookingsSvc.updateBooking(modifiedBooking)).catch(err => console.error(err));
  }

  public addBooking(booking: any) {
    let _booking: NewBooking = {
      start: this.datePipe.transform(booking.start, 'yyyy-MM-dd'),
      end: this.datePipe.transform(booking.end, 'yyyy-MM-dd'),
      travelers: booking.travelers,
      isConfirmed: true,
      agent_id: this.currentUser?.specific_id,
      client_id: booking.client_id,
      destination_id: booking.destination_id
    }
    lastValueFrom(this.bookingsSvc.addBooking(_booking)).catch(err => console.error(err));
    this.hideBookingForm();
  }

  private hideBookingForm() {
    this.showForm = false;
  }

  public async showBookingForm() {
    await lastValueFrom(this.usersSvc.getAllClientsUsers()).catch(err => console.error(err));
    this.clientsFacade.clients$.subscribe(clients => {
      if (clients) {
        this.clients = clients;
        this.showForm = true;
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('BookingsPage');
  }
}