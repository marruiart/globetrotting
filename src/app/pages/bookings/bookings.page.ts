import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, catchError, concatMap, lastValueFrom, map, of, tap, zip } from 'rxjs';
import { UserFacade } from 'src/app/core/libs/load-user/load-user.facade';
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

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  public currentUser: Client | TravelAgent | null = null;
  private mappedBookings: TableRow[] = [];
  private _bookingTable: BehaviorSubject<TableRow[]> = new BehaviorSubject<TableRow[]>([]);
  public bookingTable$: Observable<TableRow[]> = this._bookingTable.asObservable();
  public data: ClientTableRow[] = [];
  public cols: any[] = [];

  constructor(
    private bookingsSvc: BookingsService,
    private destinationSvc: DestinationsService,
    private usersSvc: UsersService,
    private agentSvc: AgentService,
    private clientSvc: ClientService,
    private userFacade: UserFacade,
    private subsSvc: SubscriptionsService,
    private translate: CustomTranslateService,
  ) {
    this.subsSvc.addSubscription({
      component: 'BookingsPage',
      sub: this.userFacade.currentSpecificUser$.subscribe(currentUser => {
        this.currentUser = currentUser;
      })
    })
  }


  async ngOnInit() {
    let bookings: Booking[] = [];
    if (this.currentUser?.type == 'AUTHENTICATED') {
      bookings = await lastValueFrom(this.bookingsSvc.getAllUserBookings());
    } else if (this.currentUser?.type == 'AGENT') {
      bookings = await lastValueFrom(this.bookingsSvc.getAllBookings());
    }
    bookings.forEach(booking => {
      if (this.currentUser?.type == 'AUTHENTICATED') {
        this.displayClientBookings(booking);
      } else if (this.currentUser?.type == 'AGENT') {
        this.displayAgentBookings(booking);
      }
    })
    this.getCols();
  }

  private getCols() {
    const destination$ = this.translate.getTranslation("bookingsPage.tableDestination");
    const start$ = this.translate.getTranslation("bookingsPage.tableStart");
    const end$ = this.translate.getTranslation("bookingsPage.tableEnd");
    const travelers$ = this.translate.getTranslation("bookingsPage.tableTravelers");
    const confirmationState$ = this.translate.getTranslation("bookingsPage.tableConfirmationState");
    const agent$ = this.translate.getTranslation("bookingsPage.tableAgent");
    const client$ = this.translate.getTranslation("bookingsPage.tableClient");

    const tableHeaders$ = zip(
      destination$,
      start$,
      end$,
      travelers$,
      confirmationState$,
      agent$,
      client$
    ).pipe(tap(([
      destination,
      start,
      end,
      travelers,
      confirmationState,
      agent,
      client
    ]) => {
      this.cols = this.translateMenuItems(destination, start, end, travelers, confirmationState, agent, client);
    }), catchError(err => of(err)));

    tableHeaders$.subscribe();
  }

  private translateMenuItems(destination: string, start: string, end: string, travelers: string, confirmationState: string, agent: string, client: string) {
    if (this.currentUser?.type == 'AUTHENTICATED') {
      return [
        { field: 'destination', header: destination },
        { field: 'start', header: start },
        { field: 'end', header: end },
        { field: 'travelers', header: travelers },
        { field: 'isConfirmed', header: confirmationState },
        { field: 'agentName', header: agent }
      ]
    } else if (this.currentUser?.type == 'AGENT') {
      return [
        { field: 'clientName', header: client },
        { field: 'destination', header: destination },
        { field: 'start', header: start },
        { field: 'end', header: end },
        { field: 'travelers', header: travelers },
        { field: 'isConfirmed', header: confirmationState }
      ]
    } else {
      return [];
    }
  }

  private mapTableRow(user: ExtUser | null, booking: Booking, destination: Destination): TableRow | null {
    if (this.currentUser?.type == 'AUTHENTICATED') {
      const clientTableRow: ClientTableRow = {
        booking_id: booking.id,
        destination: destination ? destination.name : 'Desconocido',
        start: booking.start,
        end: booking.end,
        travelers: booking.travelers,
        agentName: `${user?.name ?? "-"} ${user?.surname ?? ""}`,
        isConfirmed: booking.isConfirmed ?? false
      }
      return clientTableRow;
    } else if (this.currentUser?.type == 'AGENT') {
      const agentTableRow: AgentTableRow = {
        booking_id: booking.id,
        destination: destination ? destination.name : 'Desconocido',
        start: booking.start,
        end: booking.end,
        travelers: booking.travelers,
        clientName: `${user?.name ?? "-"} ${user?.surname ?? ""}`,
        isConfirmed: booking.isConfirmed ?? false
      }
      return agentTableRow;
    }
    return null;
  }

  private async displayClientBookings(booking: Booking) {
    const agent$ = booking.agent_id ? this.agentSvc.getAgent(booking.agent_id) : of(null);
    const destination$ = this.destinationSvc.getDestination(booking.destination_id);

    this.subsSvc.addSubscription({
      component: 'BookingsPage',
      sub: zip(agent$, destination$).pipe(
        concatMap(([agent, destination]): Observable<TableRow | null> => {
          const userAgent$ = agent ? this.usersSvc.getAgentUser(agent.user_id) : of(null);

          return userAgent$.pipe(
            concatMap(userAgent => {
              let clientTableRow = this.mapTableRow(userAgent, booking, destination);
              if (clientTableRow) {
                this.mappedBookings.push(clientTableRow)
              }
              return this.mappedBookings;
            }), catchError(err => {
              console.error(err);
              return of(null);
            }))

        }), catchError(err => {
          console.error(err);
          return of(null);
        })
      ).subscribe({
        next: _ => this._bookingTable.next(this.mappedBookings),
        error: err => console.error(err)
      })
    });
  }

  private async displayAgentBookings(booking: Booking) {
    const client$ = booking.client_id ? this.clientSvc.getClient(booking.client_id) : of(null);
    const destination$ = this.destinationSvc.getDestination(booking.destination_id);
    this.subsSvc.addSubscription({
      component: 'BookingsPage',
      sub: zip(client$, destination$).pipe(
        concatMap(([client, destination]): Observable<TableRow | null> => {
          const userClient$ = client ? this.usersSvc.getClientUser(client.user_id) : of(null);

          return userClient$.pipe(
            concatMap(userClient => {
              let agentTableRow = this.mapTableRow(userClient, booking, destination);
              if (agentTableRow) {
                this.mappedBookings.push(agentTableRow)
              }
              return this.mappedBookings;
            }), catchError(err => {
              console.error(err);
              return of(null);
            }))

        }), catchError(err => {
          console.error(err);
          return of(null);
        })
      ).subscribe({
        next: _ => this._bookingTable.next(this.mappedBookings),
        error: err => console.error(err)
      })
    });
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
      .catch(err => console.error(err));
    console.log(JSON.stringify(id));
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('BookingsPage');
  }
}
