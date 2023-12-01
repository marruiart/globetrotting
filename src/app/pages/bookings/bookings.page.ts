import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, catchError, concatMap, lastValueFrom, of, zip } from 'rxjs';
import { UserFacade } from 'src/app/core/libs/load-user/load-user.facade';
import { TravelAgent } from 'src/app/core/models/globetrotting/agent.interface';
import { Client } from 'src/app/core/models/globetrotting/client.interface';
import { AgentService } from 'src/app/core/services/api/agent.service';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { ClientService } from 'src/app/core/services/api/client.service';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { UsersService } from 'src/app/core/services/api/users.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';

interface ClientTableRow {
  destination: string,
  start: string,
  end: string,
  travelers: number,
  isConfirmed: boolean,
  agentName: string | null
}

interface AgentTableRow {
  clientName: string,
  destination: string,
  start: string,
  end: string,
  travelers: number,
  isConfirmed: boolean
}

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  private role: Client | TravelAgent | null = null;
  private _bookingTable: BehaviorSubject<ClientTableRow[] | AgentTableRow[]> = new BehaviorSubject<ClientTableRow[] | AgentTableRow[]>([]);
  public bookingTable$: Observable<ClientTableRow[] | AgentTableRow[]> = this._bookingTable.asObservable();
  public data: ClientTableRow[] = [];
  public cols: any[] = [];

  constructor(
    private bookingsSvc: BookingsService,
    private destinationSvc: DestinationsService,
    private usersSvc: UsersService,
    private agentSvc: AgentService,
    private clientSvc: ClientService,
    private userFacade: UserFacade,
    private subsSvc: SubscriptionsService
  ) {
    this.subsSvc.addSubscription({
      component: 'BookingsPage',
      sub: this.userFacade.currentSpecificUser$.subscribe(role => {
        this.role = role;
      })
    })
  }


  async ngOnInit() {
    if (this.role?.type == 'AUTHENTICATED') {
      this.displayClientBookings();
    } else if (this.role?.type == 'AGENT') {
      this.displayAgentBookings();
    }
  }

  private async displayClientBookings() {
    let mappedBookings: ClientTableRow[] = [];
    let bookings = await lastValueFrom(this.bookingsSvc.getAllUserBookings());
    bookings.forEach(booking => {
      const agent$ = booking.agent_id ? this.agentSvc.getAgent(booking.agent_id) : of(null);
      const destination$ = this.destinationSvc.getDestination(booking.destination_id);

      this.subsSvc.addSubscription({
        component: 'BookingsPage',
        sub: zip(agent$, destination$).pipe(
          concatMap(([agent, destination]): Observable<ClientTableRow | null> => {
            const userAgent$ = agent ? this.usersSvc.getAgentUser(agent.user_id) : of(null);

            return userAgent$.pipe(
              concatMap(userAgent => {
                mappedBookings.push({
                  destination: destination ? destination.name : 'Desconocido',
                  start: booking.start,
                  end: booking.end,
                  travelers: booking.travelers,
                  agentName: `${userAgent?.name ?? "-"} ${userAgent?.surname ?? ""}`,
                  isConfirmed: booking.isConfirmed ?? false
                })
                return mappedBookings;
              }), catchError(err => {
                console.error(err)
                return of(null);
              }))

          }), catchError(err => {
            console.error(err)
            return of(null);
          })
        ).subscribe({
          next: _ => this._bookingTable.next(mappedBookings),
          error: err => console.error(err)
        })
      })
    })

    this.cols = [
      { field: 'destination', header: 'Destino' },
      { field: 'start', header: 'Fecha de inicio' },
      { field: 'end', header: 'Fecha de fin' },
      { field: 'travelers', header: 'Número de viajeros' },
      { field: 'isConfirmed', header: 'Estado' },
      { field: 'agentName', header: 'Agente asignado' }
    ];
  }

  private async displayAgentBookings() {
    let mappedBookings: AgentTableRow[] = [];
    let bookings = await lastValueFrom(this.bookingsSvc.getAllUserBookings());
    bookings.forEach(booking => {
      const client$ = booking.client_id ? this.clientSvc.getClient(booking.client_id) : of(null);
      const destination$ = this.destinationSvc.getDestination(booking.destination_id);

      zip(client$, destination$).pipe(
        concatMap(([client, destination]): Observable<AgentTableRow | null> => {
          const userClient$ = client ? this.usersSvc.getClientUser(client.user_id) : of(null);

          return userClient$.pipe(
            concatMap(userClient => {
              mappedBookings.push({
                destination: destination ? destination.name : 'Desconocido',
                start: booking.start,
                end: booking.end,
                travelers: booking.travelers,
                clientName: `${userClient?.name ?? "-"} ${userClient?.surname ?? ""}`,
                isConfirmed: booking.isConfirmed ?? false
              })
              return mappedBookings;
            }), catchError(err => {
              console.error(err)
              return of(null);
            }))

        }), catchError(err => {
          console.error(err)
          return of(null);
        })
      ).subscribe({
        next: _ => this._bookingTable.next(mappedBookings),
        error: err => console.error(err)
      });
    })

    this.cols = [
      { field: 'clientName', header: 'Cliente' },
      { field: 'destination', header: 'Destino' },
      { field: 'start', header: 'Fecha de inicio' },
      { field: 'end', header: 'Fecha de fin' },
      { field: 'travelers', header: 'Número de viajeros' },
      { field: 'isConfirmed', header: 'Estado' },
    ];
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('BookingsPage');
  }
}
