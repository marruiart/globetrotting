import { DatePipe } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { BehaviorSubject, Observable, catchError, concatMap, forkJoin, lastValueFrom, map, of, switchMap, tap, zip } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { BookingsFacade } from 'src/app/core/+state/bookings/bookings.facade';
import { DestinationsFacade } from 'src/app/core/+state/destinations/destinations.facade';
import { BookingsTableRow, ClientBookingsTableRow, NewBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { ExtUser, User } from 'src/app/core/models/globetrotting/user.interface';
import { StrapiPayload } from 'src/app/core/models/strapi-interfaces/strapi-data.interface';
import { AgentService } from 'src/app/core/services/api/agent.service';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { ClientService } from 'src/app/core/services/api/client.service';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { UsersService } from 'src/app/core/services/api/users.service';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

interface TableRow {
  booking_id: number | string,
  destination_id: number | string,
  destination: string,
  start: string | null,
  end: string | null,
  travelers: number,
  isConfirmed: boolean
}

interface ClientTableRow extends TableRow {
  agentName: string | null
}

interface AgentTableRow extends TableRow {
  clientName: string,
}

interface AdminTableRow extends TableRow {
  agentName: string | number | null
  clientName: string,
}

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage {
  public destinations: Destination[] = [];
  public currentUser: User | null = null;
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
    private bookingsSvc: BookingsService,
    private destinationsFacade: DestinationsFacade,
    private authFacade: AuthFacade,
    private subsSvc: SubscriptionsService,
    private translate: CustomTranslateService,
    private datePipe: DatePipe
  ) {
    this.isResponsive = window.innerWidth < 960;
    this.init();
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
            if (table)
              this.loading = false;
          })
      }
    ])
  }

  private async init() {
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
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case 'ADMIN':
          return [
            { field: 'booking_id', header: bookingId },
            { field: 'clientName', header: client },
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
      }
    } else {
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

  public showBookingForm() {
    this.showForm = true;
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('BookingsPage');
  }
}