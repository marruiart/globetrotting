import { Component, HostListener, OnDestroy } from '@angular/core';
import { catchError, lastValueFrom, of, switchMap, tap, zip } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { BookingsFacade } from 'src/app/core/+state/bookings/bookings.facade';
import { ClientsFacade } from 'src/app/core/+state/clients/clients.facade';
import { DestinationsFacade } from 'src/app/core/+state/destinations/destinations.facade';
import { BookingsTableRow, NewBooking } from 'src/app/core/models/globetrotting/booking.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { AdminAgentOrClientUser, User } from 'src/app/core/models/globetrotting/user.interface';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { UsersService } from 'src/app/core/services/api/users.service';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { Roles } from 'src/app/core/utilities/utilities';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnDestroy {
  private readonly RESPONSIVE_SIZE = 960;
  private readonly COMPONENT = 'BookingsPage';

  public destinations: Destination[] = [];
  public currentUser: AdminAgentOrClientUser | null = null;
  public clients: User[] | null = null;
  public cols: any[] = [];
  public loading: boolean = true;
  public showForm: boolean = false;
  public isResponsive: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isResponsive = this.checkResponsiveState();
  }

  constructor(
    // Services
    public usersSvc: UsersService,
    private bookingsSvc: BookingsService,
    private subsSvc: SubscriptionsService,
    private translate: CustomTranslateService,
    // Facades
    public bookingsFacade: BookingsFacade,
    private authFacade: AuthFacade,
    private clientsFacade: ClientsFacade,
    private destinationsFacade: DestinationsFacade
  ) {
    this.isResponsive = this.checkResponsiveState();
    this.bookingsFacade.initBookings();
    this.destinationsFacade.initDestinations();
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subsSvc.addSubscriptions(this.COMPONENT,
      // Fetch data
      this.authFacade.currentUser$.subscribe(currentUser => this.currentUser = currentUser),
      this.bookingsFacade.bookingTable$.subscribe((table) => { if (table) this.loading = false }),
      this.destinationsFacade.destinations$.subscribe((destinations) => this.destinations = destinations),
      // Translation
      this.translate.language$.pipe(switchMap((_: string) => this.getCols()), catchError(err => of(err))).subscribe()
    );
  }

  private checkResponsiveState(): boolean {
    return window.innerWidth < this.RESPONSIVE_SIZE;
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
      case Roles.ADMIN:
        return [
          { field: 'booking_id', header: bookingId },
          { field: 'clientName', header: client },
          { field: 'agentName', header: agent },
          { field: 'dates', header: dates },
          { field: 'travelers', header: travelers },
          { field: 'isConfirmed', header: confirmationState }
        ]
      case Roles.AGENT:
        return [
          { field: 'booking_id', header: bookingId },
          { field: 'clientName', header: client },
          { field: 'dates', header: dates },
          { field: 'travelers', header: travelers },
          { field: 'isConfirmed', header: confirmationState }
        ]
      case Roles.AUTHENTICATED:
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

  /**
 * Confirms a booking by updating its status and assigning the current agent's ID.
 *
 * This method updates the booking status to confirmed and assigns the current agent's ID.
 * If the agent's ID is not available, it logs an error message.
 *
 * @param booking The booking to be confirmed.
 */
  public async confirmBook(booking: BookingsTableRow) {
    const agent_id = this.currentUser?.specific_id;
    if (agent_id) {
      let modifiedBooking: any = {
        ...booking,
        id: booking.booking_id,
        isConfirmed: true,
        agent_id: agent_id
      }
      lastValueFrom(this.bookingsSvc.updateBooking(modifiedBooking)).catch(err => console.error(err));
    } else {
      console.error('ERROR: Unknown agent id. The booking could not be confirmed.');
    }
  }

  /**
 * Adds a new booking.
 *
 * This method adds a new booking by calling the booking service and then hides the booking form.
 *
 * @param booking The new booking to be added.
 */
  public addBooking(booking: NewBooking) {
    lastValueFrom(this.bookingsSvc.addBooking(booking)).catch(err => console.error(err));
    this.hideBookingForm();
  }

  private hideBookingForm() {
    this.showForm = false;
  }

  /**
 * Shows the booking form after retrieving all clients.
 *
 * This method retrieves all clients and shows the booking form if both the clients and destinations are available.
 */
  public async showBookingForm() {
    await lastValueFrom(this.usersSvc.getAllClientsUsers()).catch(err => console.error(err));
    this.clientsFacade.clients$.subscribe(clients => {
      if (this.destinations.length > 0 && clients.length > 0) {
        this.clients = clients;
        this.showForm = true;
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('BookingsPage');
  }
}