import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, catchError, concatMap, exhaustMap, forkJoin, lastValueFrom, map, mergeMap, of, switchMap, zip } from 'rxjs';
import { Booking } from 'src/app/core/models/globetrotting/booking.interface';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { AgentService } from 'src/app/core/services/api/agent.service';
import { BookingsService } from 'src/app/core/services/api/bookings.service';
import { DestinationsService } from 'src/app/core/services/api/destinations.service';
import { UsersService } from 'src/app/core/services/api/users.service';

interface BookingTableRow {
  destination: string,
  start: string,
  end: string,
  travelers: number,
  isConfirmed: boolean,
  agentName: string | null
}

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  private _bookingTable: BehaviorSubject<BookingTableRow[]> = new BehaviorSubject<BookingTableRow[]>([]);
  public bookingTable$: Observable<BookingTableRow[]> = this._bookingTable.asObservable();
  public data: BookingTableRow[] = [];
  public cols: any[] = [];

  constructor(
    private bookingsSvc: BookingsService,
    private destinationSvc: DestinationsService,
    private usersSvc: UsersService,
    private agentSvc: AgentService
  ) { }

  async ngOnInit() {
    let x = 0;
    let y = 0;
    let mappedBookings: BookingTableRow[] = [];
    let bookings = await lastValueFrom(this.bookingsSvc.getAllClientBookings());
    bookings.forEach(booking => {
      const agent$ = booking.agent_id ? this.agentSvc.getAgent(booking.agent_id) : of(null);
      const destination$ = this.destinationSvc.getDestination(booking.destination_id);

      zip(agent$, destination$).pipe(
        concatMap(([agent, destination]): Observable<BookingTableRow | null> => {
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
      });
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

}
