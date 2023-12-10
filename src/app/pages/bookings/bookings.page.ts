import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { BehaviorSubject, Observable, catchError, concatMap, forkJoin, lastValueFrom, map, of, switchMap, tap, zip } from 'rxjs';
import { UserFacade } from 'src/app/core/+state/load-user/load-user.facade';
import { TravelAgent } from 'src/app/core/models/globetrotting/agent.interface';
import { Booking } from 'src/app/core/models/globetrotting/booking.interface';
import { Client } from 'src/app/core/models/globetrotting/client.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { ExtUser } from 'src/app/core/models/globetrotting/user.interface';
import { StrapiPayload } from 'src/app/core/models/strapi-interfaces/strapi-data.interface';
import { AgentService } from 'src/app/core/services/api/agent.service';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { ClientService } from 'src/app/core/services/api/client.service';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { UsersService } from 'src/app/core/services/api/users.service';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

interface TableRow {
  booking_id: number,
  destination_id: number,
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
  agentName: string | null
  clientName: string,
}

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage {
  public currentUser: Client | TravelAgent | null = null;
  private _bookingTable: BehaviorSubject<TableRow[]> = new BehaviorSubject<TableRow[]>(new Array(10));
  public bookingTable$: Observable<TableRow[]> = this._bookingTable.asObservable();
  public data: ClientTableRow[] = [];
  public cols: any[] = [];
  public loading: boolean = true;
  isResponsive: boolean = false;
  @HostListener('window:resize', ['$event'])

  onResize(event: Event) {
    this.isResponsive = window.innerWidth < 960;
  }

  constructor(
    private bookingsSvc: BookingsService,
    private destinationSvc: DestinationsService,
    private usersSvc: UsersService,
    private agentSvc: AgentService,
    private clientSvc: ClientService,
    private userFacade: UserFacade,
    private subsSvc: SubscriptionsService,
    private translate: CustomTranslateService
  ) {
    this.isResponsive = window.innerWidth < 960;
    this.subsSvc.addSubscriptions([
      {
        component: 'BookingsPage',
        sub: this.userFacade.currentSpecificUser$.subscribe(currentUser => {
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
        sub: this.translate.language$.pipe(
          switchMap((_: string) => this.getCols()),
          catchError(err => of(err)))
          .subscribe()
      },
      {
        component: 'BookingsPage',
        sub: this.displayTable().subscribe((table: TableRow[]) => {
          this._bookingTable.next(table);
          this.loading = false;
        })
      },
      {
        component: 'BookingsPage',
        sub: this.bookingsSvc.getAllBookings().subscribe()
      },
      {
        component: 'BookingsPage',
        sub: this.bookingsSvc.getAllUserBookings().subscribe()
      }
    ])
  }

  /**
   * Obtains from the bookings service an array of Booking and maps each of them into a TableRow. 
   * It takes into account if the TableRow to be displayed is for a client or an agent/admin.
   * @returns an observable of an array of TableRow.
   */
  private displayTable(): Observable<TableRow[]> {
    if (this.currentUser?.type == 'AUTHENTICATED') {
      return this.bookingsSvc.userBookings$.pipe(
        switchMap((bookings: Booking[]): Observable<TableRow[]> => this.mapClientBookingsRows(bookings)),
        catchError(err => of(err))
      )
    } else if (this.currentUser?.type == 'AGENT') {
      return this.bookingsSvc.allBookings$.pipe(
        switchMap((bookings: Booking[]): Observable<TableRow[]> => this.mapAgentBookingsRows(bookings)),
        catchError(err => of(err))
      )
    } else {
      return of([]);
    }
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
    if (this.currentUser?.type == 'AUTHENTICATED') {
      return [
        { field: 'dates', header: dates },
        { field: 'travelers', header: travelers },
        { field: 'isConfirmed', header: confirmationState },
        { field: 'agentName', header: agent }
      ]
    } else if (this.currentUser?.type == 'AGENT') {
      return [
        { field: 'booking_id', header: bookingId },
        { field: 'clientName', header: client },
        { field: 'dates', header: dates },
        { field: 'travelers', header: travelers },
        { field: 'isConfirmed', header: confirmationState }
      ]
    } else {
      return [];
    }
  }

  private mapTableRow(user: ExtUser | null, booking: Booking, destination: Destination): TableRow {
    if (this.currentUser?.type == 'AUTHENTICATED') {
      console.log(`${destination.name}: ${destination.id}`);
      const clientTableRow: ClientTableRow = {
        booking_id: booking.id,
        destination_id: destination.id ?? 0,
        destination: destination ? destination.name : 'Desconocido',
        start: booking.start,
        end: booking.end,
        travelers: booking.travelers,
        agentName: `${user?.name ?? "-"} ${user?.surname ?? ""}`,
        isConfirmed: booking.isConfirmed ?? false
      }
      return clientTableRow;
    } else {
      console.log(`${destination.name}: ${destination.id}`);
      const agentTableRow: AgentTableRow = {
        booking_id: booking.id,
        destination_id: destination.id ?? 0,
        destination: destination ? destination.name : 'Desconocido',
        start: booking.start,
        end: booking.end,
        travelers: booking.travelers,
        clientName: `${user?.name ?? "-"} ${user?.surname ?? ""}`,
        isConfirmed: booking.isConfirmed ?? false
      }
      return agentTableRow;
    }
  }

  /**
   * Receives an array of bookings and turn it into an array of rows ready to display on a table.
   * @param bookings array of all the bookings
   * @returns an observable with all the rows of the table to be displayed
   */
  private mapAgentBookingsRows(bookings: Booking[]): Observable<TableRow[]> {
    let tableRowObs: Observable<TableRow>[] = [];

    for (let booking of bookings) {
      const client$ = booking.client_id ? this.clientSvc.getClient(booking.client_id) : of(null);
      const destination$ = this.destinationSvc.getDestination(booking.destination_id);

      // For each booking, add a TableRow observable
      tableRowObs.push(zip(client$, destination$).pipe(
        switchMap(([client, destination]): Observable<TableRow> => {
          const userClient$ = client ? this.usersSvc.getClientUser(client.user_id) : of(null);

          return userClient$.pipe(
            switchMap((userClient): Observable<TableRow> => {
              return of(this.mapTableRow(userClient, booking, destination));
            }), catchError(err => {
              return of(err);
            }))
        }), catchError(err => {
          return of(err);
        })))
    }
    // ForkJoin the "array of observables" to return "an observable of an array"
    return forkJoin(tableRowObs);
  }

  /**
   * Receives an array of bookings and turn it into an array of rows ready to display on a table.
   * @param bookings array of the current user bookings
   * @returns an observable with all the rows of the table to be displayed
   */
  private mapClientBookingsRows(bookings: Booking[]): Observable<TableRow[]> {
    let tableRowObs: Observable<TableRow>[] = [];

    for (let booking of bookings) {
      const agent$ = booking.agent_id ? this.agentSvc.getAgent(booking.agent_id) : of(null);
      const destination$ = this.destinationSvc.getDestination(booking.destination_id);

      // For each booking, add a TableRow observable
      tableRowObs.push(zip(agent$, destination$).pipe(
        concatMap(([agent, destination]): Observable<TableRow> => {
          const userAgent$ = agent ? this.usersSvc.getAgentUser(agent.user_id) : of(null);

          return userAgent$.pipe(
            concatMap((userAgent: ExtUser | null): Observable<TableRow> => {
              return of(this.mapTableRow(userAgent, booking, destination));
            }), catchError(err => {
              return of(err);
            }))

        }), catchError(err => {
          return of(err);
        })
      ))
    }
    // ForkJoin the "array of observables" to return "an observable of an array"
    return forkJoin(tableRowObs);
  }

  public confirmBook(id: number) {
    let modifiedBooking: StrapiPayload<any> = {
      data: {
        id: id,
        isConfirmed: true,
        agent_id: this.currentUser?.id
      }
    }
    lastValueFrom(this.bookingsSvc.updateBooking(modifiedBooking))
      .then(_ => {
        lastValueFrom(this.displayTable())
          .catch(err => console.error(err));
      }).catch(err => console.error(err));
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('BookingsPage');
  }
}
