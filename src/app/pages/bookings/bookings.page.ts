import { Component, OnInit } from '@angular/core';
import { Observable, catchError, concatMap, forkJoin, map, mergeMap, of, switchMap, zip } from 'rxjs';
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
  public data: BookingTableRow[] = [];
  public cols: any[] = [];

  constructor(
    private bookingsSvc: BookingsService,
    private destinationSvc: DestinationsService,
    private usersSvc: UsersService,
    private agentSvc: AgentService
  ) { }

  /*
          const bookingObservables = bookings.map((booking: Booking): Observable<BookingTableRow | null> => {
          const agent$ = booking.agent_id ? this.agentSvc.getAgent(booking.agent_id) : of(null);
          const destination$ = this.destinationSvc.getDestination(booking.destination_id);

          return zip([agent$, destination$]).pipe(
            concatMap(([agent, destination]): Observable<BookingTableRow | null> => {
              const userAgent$ = agent ? this.usersSvc.getAgent(agent.id) : of(null);

              return userAgent$.pipe(
                map((userAgent: User | null): BookingTableRow | null => {
                  return {
                    destination: destination ? destination.name : 'Desconocido',
                    start: booking.start,
                    end: booking.end,
                    travelers: booking.travelers,
                    agentName: (userAgent?.name && userAgent.surname) ? `${userAgent.name} ${userAgent.surname}` : '-',
                    isConfirmed: booking.isConfirmed ?? false
                  };
                }))
            }))
        });

        return bookingObservables;
  */

  ngOnInit() {
    let obs: Observable<BookingTableRow[]> = this.bookingsSvc.getAllClientBookings().pipe(
      switchMap((bookings: Booking[]): Observable<BookingTableRow[]> => {

        return of(bookings.map((booking: Booking): BookingTableRow => ({
          destination: 'Desconocido',
          start: booking.start,
          end: booking.end,
          travelers: booking.travelers,
          agentName: '-',
          isConfirmed: booking.isConfirmed ?? false
        })))
      }));

    obs.subscribe({
      next: res => {
        this.data = res;
        this.cols = [
          { field: 'destination', header: 'Destino' },
          { field: 'start', header: 'Fecha de inicio' },
          { field: 'end', header: 'Fecha de fin' },
          { field: 'travelers', header: 'Número de viajeros' },
          { field: 'isConfirmed', header: 'Estado' },
          { field: 'agentName', header: 'Agente asignado' }
        ];
      },
      error: err => console.error(err)
    })


  }

}
